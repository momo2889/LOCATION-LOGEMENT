<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Vérifie que l'utilisateur authentifié possède la permission requise.
 *
 * Usage :  ->middleware('permission:listings.create')
 *
 * Plus fin que le contrôle par rôle : on autorise sur la capacité précise.
 */
class EnsureHasPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Non authentifié.', 401, code: 'UNAUTHENTICATED');
        }

        if (! $user->hasPermission($permission)) {
            return ApiResponse::error(
                "Vous n'avez pas la permission requise pour cette action.",
                403,
                code: 'FORBIDDEN',
            );
        }

        return $next($request);
    }
}
