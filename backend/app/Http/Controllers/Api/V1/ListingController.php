<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use App\Support\ApiResponse;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Annonces de logement : recherche publique + CRUD réservé au propriétaire.
 *
 * Le classement applique le boost Premium (annonces d'abord), puis la note et
 * la fraîcheur — sans jamais exposer le statut Premium au visiteur.
 */
class ListingController extends Controller
{
    private const TYPES = ['Studio', 'Chambre', 'Appartement', 'Villa'];
    private const DURATIONS = ['courte', 'longue'];

    /** Recherche publique avec filtres (quartier, type, budget, chambres…). */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'q' => ['sometimes', 'nullable', 'string', 'max:120'],
            'type' => ['sometimes', 'nullable', Rule::in(self::TYPES)],
            'neighborhood_id' => ['sometimes', 'nullable', 'integer', 'exists:neighborhoods,id'],
            'budget' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'min_price' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'rooms' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'furnished' => ['sometimes', 'nullable', 'boolean'],
            'duration' => ['sometimes', 'nullable', Rule::in(self::DURATIONS)],
            'sort' => ['sometimes', 'nullable', Rule::in(['recommended', 'price_asc', 'price_desc', 'rating'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:48'],
        ]);

        $query = Listing::query()
            ->with(['neighborhood', 'owner'])
            ->where('status', 'published');

        if (! empty($filters['q'])) {
            $term = '%'.$filters['q'].'%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'ilike', $term)
                    ->orWhereHas('neighborhood', fn ($n) => $n->where('name', 'ilike', $term));
            });
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (! empty($filters['neighborhood_id'])) {
            $query->where('neighborhood_id', $filters['neighborhood_id']);
        }
        if (! empty($filters['budget'])) {
            $query->where('price', '<=', $filters['budget']);
        }
        if (! empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }
        if (! empty($filters['rooms'])) {
            $query->where('rooms', '>=', $filters['rooms']);
        }
        if (array_key_exists('furnished', $filters) && $filters['furnished'] !== null) {
            $query->where('furnished', (bool) $filters['furnished']);
        }
        if (! empty($filters['duration'])) {
            $query->where('duration', $filters['duration']);
        }

        // Tri : par défaut « recommandé » = Premium d'abord (boost invisible),
        // puis note puis fraîcheur. Les autres tris restent explicites.
        match ($filters['sort'] ?? 'recommended') {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('rating')->orderByDesc('created_at'),
            default => $query->orderByDesc('is_premium')->orderByDesc('rating')->orderByDesc('created_at'),
        };

        $listings = $query->paginate($filters['per_page'] ?? 12)->withQueryString();

        return ApiResponse::success([
            'items' => ListingResource::collection($listings)->resolve(),
            'meta' => [
                'total' => $listings->total(),
                'per_page' => $listings->perPage(),
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
            ],
        ]);
    }

    /** Détail public d'une annonce. */
    public function show(Listing $listing): JsonResponse
    {
        if ($listing->status !== 'published') {
            // Seul le propriétaire peut consulter son brouillon.
            $user = request()->user();
            if (! $user || $user->id !== $listing->owner_id) {
                return ApiResponse::error('Annonce introuvable.', 404);
            }
        }

        return ApiResponse::success(
            new ListingResource($listing->load(['neighborhood', 'owner'])),
        );
    }

    /** Liste des annonces du propriétaire connecté (tous statuts). */
    public function mine(Request $request): JsonResponse
    {
        $listings = Listing::query()
            ->with(['neighborhood', 'owner'])
            ->where('owner_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return ApiResponse::success(ListingResource::collection($listings)->resolve());
    }

    /** Création d'une annonce (propriétaire). */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);

        $data['owner_id'] = $request->user()->id;
        $data['slug'] = $this->uniqueSlug($data['title']);
        $data['status'] = $data['status'] ?? 'published';

        $listing = Listing::create($data);

        Audit::log('listing.created', $listing, ['title' => $listing->title]);

        return ApiResponse::success(
            new ListingResource($listing->load(['neighborhood', 'owner'])),
            'Annonce publiée.',
            201,
        );
    }

    /** Mise à jour (propriétaire de l'annonce uniquement). */
    public function update(Request $request, Listing $listing): JsonResponse
    {
        if ($listing->owner_id !== $request->user()->id) {
            return ApiResponse::error("Vous n'êtes pas le propriétaire de cette annonce.", 403);
        }

        $data = $this->validatePayload($request, partial: true);
        $listing->fill($data)->save();

        Audit::log('listing.updated', $request->user(), ['listing_id' => $listing->id]);

        return ApiResponse::success(
            new ListingResource($listing->fresh()->load(['neighborhood', 'owner'])),
            'Annonce mise à jour.',
        );
    }

    /** Suppression (propriétaire de l'annonce uniquement). */
    public function destroy(Request $request, Listing $listing): JsonResponse
    {
        if ($listing->owner_id !== $request->user()->id) {
            return ApiResponse::error("Vous n'êtes pas le propriétaire de cette annonce.", 403);
        }

        $listing->delete();
        Audit::log('listing.deleted', $request->user(), ['listing_id' => $listing->id]);

        return ApiResponse::success(null, 'Annonce supprimée.');
    }

    /** Règles de validation partagées entre création et mise à jour. */
    private function validatePayload(Request $request, bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'title' => [$req, 'string', 'min:6', 'max:160'],
            'type' => [$req, Rule::in(self::TYPES)],
            'price' => [$req, 'integer', 'min:10000', 'max:100000000'],
            'rooms' => [$req, 'integer', 'min:0', 'max:50'],
            'bathrooms' => [$req, 'integer', 'min:0', 'max:50'],
            'area' => [$req, 'integer', 'min:5', 'max:5000'],
            'neighborhood_id' => [$req, 'integer', 'exists:neighborhoods,id'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'furnished' => ['sometimes', 'boolean'],
            'duration' => ['sometimes', Rule::in(self::DURATIONS)],
            'lat' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'lng' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'images' => ['sometimes', 'nullable', 'array', 'max:12'],
            'images.*' => ['string', 'max:500'],
            'pano' => ['sometimes', 'nullable', 'string', 'max:500'],
            'status' => ['sometimes', Rule::in(['published', 'draft'])],
        ]);
    }

    /** Génère un slug unique à partir du titre. */
    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'annonce';
        $slug = $base;
        $i = 2;
        while (Listing::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
