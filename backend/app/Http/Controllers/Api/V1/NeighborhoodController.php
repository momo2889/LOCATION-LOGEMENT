<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Neighborhood;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * Référentiel public des quartiers (utilisé par les filtres de recherche
 * et les formulaires d'annonce). Lecture seule côté visiteur.
 */
class NeighborhoodController extends Controller
{
    public function index(): JsonResponse
    {
        $neighborhoods = Neighborhood::query()
            ->orderBy('city')
            ->orderBy('name')
            ->get(['id', 'name', 'city', 'region', 'country', 'slug']);

        return ApiResponse::success($neighborhoods);
    }
}
