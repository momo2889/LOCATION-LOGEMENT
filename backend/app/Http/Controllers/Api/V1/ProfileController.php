<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Support\ApiResponse;
use App\Support\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Gestion du profil de l'utilisateur connecté et de ses espaces (rôles).
 */
class ProfileController extends Controller
{
    /** Mise à jour des informations de profil. */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:32', 'regex:/^\+?[0-9\s\-]{7,20}$/'],
            'whatsapp' => ['sometimes', 'nullable', 'string', 'max:32', 'regex:/^\+?[0-9\s\-]{7,20}$/'],
            // Pseudo Instagram sans @ (lettres, chiffres, points, underscores).
            'instagram' => ['sometimes', 'nullable', 'string', 'max:64', 'regex:/^[A-Za-z0-9._]{1,64}$/'],
            'locale' => ['sometimes', Rule::in(['fr', 'en', 'wo'])],
        ]);

        $user = $request->user();
        $user->fill($data)->save();

        Audit::log('profile.updated', $user, ['fields' => array_keys($data)]);

        return ApiResponse::success(
            new UserResource($user->load('roles.permissions')),
            'Profil mis à jour.',
        );
    }

    /**
     * Active l'espace propriétaire pour un compte locataire (cumul des rôles).
     * Permet la bascule locataire ⇄ propriétaire décrite dans le cahier des charges.
     */
    public function enableOwnerSpace(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole(Role::OWNER)) {
            return ApiResponse::success(
                new UserResource($user->load('roles.permissions')),
                'Votre espace propriétaire est déjà actif.',
            );
        }

        $ownerId = Role::where('name', Role::OWNER)->value('id');
        $user->roles()->syncWithoutDetaching([$ownerId]);

        Audit::log('profile.owner_space_enabled', $user);

        return ApiResponse::success(
            new UserResource($user->fresh()->load('roles.permissions')),
            'Espace propriétaire activé.',
        );
    }
}
