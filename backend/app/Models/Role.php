<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Rôle RBAC (tenant, owner, admin). Regroupe un ensemble de permissions.
 */
class Role extends Model
{
    protected $fillable = ['name', 'label', 'description'];

    // Noms de rôles canoniques — référencés partout via ces constantes
    // pour éviter les fautes de frappe dans les vérifications d'accès.
    public const TENANT = 'tenant';   // Locataire
    public const OWNER = 'owner';     // Propriétaire
    public const ADMIN = 'admin';     // Administrateur système

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
