<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'whatsapp',
        'instagram',
        'password',
        'avatar_path',
        'locale',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    // ---------------------------------------------------------------------
    // Relations
    // ---------------------------------------------------------------------

    /** Rôles attribués à l'utilisateur (un compte peut cumuler tenant + owner). */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    // ---------------------------------------------------------------------
    // RBAC — helpers (utilisés par les policies/middleware CÔTÉ SERVEUR)
    // ---------------------------------------------------------------------

    /** L'utilisateur possède-t-il ce rôle ? (accepte un nom ou une liste de noms) */
    public function hasRole(string|array $roles): bool
    {
        $names = $this->roles->pluck('name');

        return $names->intersect((array) $roles)->isNotEmpty();
    }

    /** L'utilisateur possède-t-il cette permission (via l'un de ses rôles) ? */
    public function hasPermission(string $permission): bool
    {
        return $this->roles
            ->loadMissing('permissions')
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->contains($permission);
    }

    /** Raccourci de lisibilité pour les vérifications admin. */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Liste plate des noms de permissions — pratique pour exposer au front
     * (le front adapte l'UI, mais l'autorisation réelle reste côté serveur).
     *
     * @return array<int, string>
     */
    public function permissionNames(): array
    {
        return $this->roles
            ->loadMissing('permissions')
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->unique()
            ->values()
            ->all();
    }
}
