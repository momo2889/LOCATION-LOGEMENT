<?php

namespace App\Http\Requests\Auth;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Validation de l'inscription. Un visiteur choisit son espace de départ
 * (locataire ou propriétaire) ; le rôle admin n'est jamais auto-attribuable.
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Route publique
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:32', 'regex:/^\+?[0-9\s\-]{7,20}$/'],
            'password' => [
                'required', 'confirmed',
                Password::min(8)->mixedCase()->numbers(), // Politique de robustesse
            ],
            // Espace initial : locataire par défaut. Admin volontairement interdit.
            'role' => ['nullable', Rule::in([Role::TENANT, Role::OWNER])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'Un compte existe déjà avec cette adresse email.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ];
    }
}
