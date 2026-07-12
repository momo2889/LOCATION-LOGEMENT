<?php

namespace App\Http\Resources;

use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Représentation publique d'une annonce.
 *
 * IMPORTANT : le statut Premium (annonce boostée) n'est JAMAIS exposé — il
 * n'influence que le classement, de façon transparente pour le visiteur.
 *
 * @mixin Listing
 */
class ListingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type,
            'price' => $this->price,
            'rooms' => $this->rooms,
            'bathrooms' => $this->bathrooms,
            'area' => $this->area,
            'furnished' => $this->furnished,
            'duration' => $this->duration,
            'rating' => $this->rating,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'images' => $this->images ?? [],
            'pano' => $this->pano,
            'status' => $this->status,
            'neighborhood' => $this->whenLoaded('neighborhood', fn () => [
                'id' => $this->neighborhood?->id,
                'name' => $this->neighborhood?->name,
                'city' => $this->neighborhood?->city,
            ]),
            'owner' => $this->whenLoaded('owner', fn () => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
                'is_verified' => $this->owner->verification_status === 'verified',
                // Coordonnées publiques pour le contact direct (téléphone, WhatsApp, Instagram).
                'phone' => $this->owner->phone,
                'whatsapp' => $this->owner->whatsapp,
                'instagram' => $this->owner->instagram,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
