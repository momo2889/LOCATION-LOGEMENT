<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Représentation publique d'un utilisateur exposée par l'API.
 *
 * On ne renvoie JAMAIS de champ sensible (mot de passe, tokens). On expose
 * rôles + permissions pour que le front adapte l'UI — l'autorisation réelle
 * restant toujours vérifiée côté serveur.
 *
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'instagram' => $this->instagram,
            'avatar_path' => $this->avatar_path,
            'locale' => $this->locale,
            'verification_status' => $this->verification_status,
            'is_verified' => $this->verification_status === 'verified',
            'email_verified' => $this->email_verified_at !== null,
            'roles' => $this->roles->pluck('name'),
            'permissions' => $this->permissionNames(),
            'created_at' => $this->created_at,
        ];
    }
}
