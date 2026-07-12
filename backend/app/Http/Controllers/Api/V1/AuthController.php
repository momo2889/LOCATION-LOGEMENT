<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\Audit;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Authentification par tokens Sanctum.
 *
 * Chaque parcours sensible est journalisé (audit) et la connexion est protégée
 * contre le bruteforce (RateLimiter par email + IP). Les opérations critiques
 * (création de compte) sont encapsulées dans une transaction.
 */
class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur + délivrance d'un token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Transaction : la création de l'utilisateur ET l'attribution du rôle
        // doivent réussir ensemble, ou aucune des deux.
        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'], // haché automatiquement (cast 'hashed')
                'locale' => 'fr',
            ]);

            // Espace initial demandé (locataire par défaut).
            $roleName = $data['role'] ?? Role::TENANT;
            $roleId = Role::where('name', $roleName)->value('id');
            $user->roles()->sync([$roleId]);

            return $user;
        });

        Audit::log('auth.register', $user, ['role' => $data['role'] ?? Role::TENANT], $user);

        $token = $user->createToken($this->deviceName($request))->plainTextToken;

        return ApiResponse::success(
            ['user' => new UserResource($user->load('roles.permissions')), 'token' => $token],
            'Compte créé avec succès.',
            201,
        );
    }

    /**
     * Connexion : vérifie les identifiants, applique un anti-bruteforce,
     * puis délivre un token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $throttleKey = Str::lower($data['email']).'|'.$request->ip();

        // Anti-bruteforce : 5 tentatives / minute par (email + IP).
        if (RateLimiter::tooManyAttempts($throttleKey, maxAttempts: 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            Audit::log('auth.login.throttled', null, ['email' => $data['email']]);

            throw ValidationException::withMessages([
                'email' => ["Trop de tentatives. Réessayez dans {$seconds} secondes."],
            ])->status(429);
        }

        $user = User::where('email', $data['email'])->first();

        // Message volontairement générique (on ne révèle pas si l'email existe).
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            RateLimiter::hit($throttleKey, decaySeconds: 60);
            Audit::log('auth.login.failed', $user, ['email' => $data['email']], $user);

            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        if (! $user->is_active) {
            Audit::log('auth.login.blocked', $user, ['reason' => 'inactive'], $user);

            return ApiResponse::error('Ce compte est désactivé.', 403, code: 'ACCOUNT_DISABLED');
        }

        RateLimiter::clear($throttleKey);
        $user->forceFill(['last_login_at' => now()])->save();

        Audit::log('auth.login', $user, [], $user);

        $token = $user->createToken($this->deviceName($request))->plainTextToken;

        return ApiResponse::success(
            ['user' => new UserResource($user->load('roles.permissions')), 'token' => $token],
            'Connexion réussie.',
        );
    }

    /**
     * Profil de l'utilisateur connecté.
     */
    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(
            new UserResource($request->user()->load('roles.permissions')),
        );
    }

    /**
     * Déconnexion : révoque le token courant (les autres restent valides).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        Audit::log('auth.logout', $request->user(), [], $request->user());

        return ApiResponse::success(null, 'Déconnexion réussie.');
    }

    /**
     * Envoi d'un lien de réinitialisation de mot de passe.
     * Réponse toujours identique (anti-énumération d'emails).
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink($request->only('email'));

        return ApiResponse::success(
            null,
            'Si un compte correspond à cette adresse, un email de réinitialisation a été envoyé.',
        );
    }

    /**
     * Réinitialisation effective du mot de passe via le token reçu par email.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->validated(),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete(); // Révoque toutes les sessions existantes
                event(new PasswordReset($user));
                Audit::log('auth.password.reset', $user, [], $user);
            },
        );

        if ($status !== Password::PasswordReset) {
            throw ValidationException::withMessages([
                'email' => ['Le lien de réinitialisation est invalide ou expiré.'],
            ]);
        }

        return ApiResponse::success(null, 'Mot de passe réinitialisé. Vous pouvez vous connecter.');
    }

    /** Nom lisible du token/device pour la gestion des sessions. */
    private function deviceName(Request $request): string
    {
        return $request->input('device_name')
            ?: Str::limit((string) $request->userAgent(), 100, '');
    }
}
