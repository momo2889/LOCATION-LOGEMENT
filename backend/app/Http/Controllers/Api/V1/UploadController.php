<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Upload d'images (photos d'annonce et panorama 360°).
 *
 * Les fichiers sont stockés sur le disque « public » ; l'API renvoie les URLs
 * absolues, que le front réutilise ensuite dans le champ `images` d'une annonce.
 * Réservé aux propriétaires (les seuls à publier des annonces).
 */
class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'photos' => ['required', 'array', 'min:1', 'max:12'],
            'photos.*' => ['image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // 5 Mo / photo
        ]);

        $urls = [];
        foreach ($request->file('photos') as $photo) {
            // Nom aléatoire → pas de collision ni de fuite du nom d'origine.
            $path = $photo->store('listings', 'public');
            $urls[] = asset('storage/'.$path);
        }

        return ApiResponse::success(['urls' => $urls], 'Photos téléversées.', 201);
    }
}
