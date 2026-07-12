<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Vérifie que l'utilisateur authentifié possède AU MOINS un des rôles requis.
 *
 * Usage dans les routes :  ->middleware('role:admin')
 *                          ->middleware('role:owner,admin')
 *
 * L'autorisation est ainsi imposée CÔTÉ SERVEUR, jamais seulement au front.
 */
class EnsureHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Non authentifié.', 401, code: 'UNAUTHENTICATED');
        }

        if (! $user->hasRole($roles)) {
            return ApiResponse::error(
                "Vous n'avez pas les droits nécessaires pour cette action.",
                403,
                code: 'FORBIDDEN',
            );
        }

        return $next($request);
    }
}
