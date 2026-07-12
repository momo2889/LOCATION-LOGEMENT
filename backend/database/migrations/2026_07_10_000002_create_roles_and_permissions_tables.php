<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Schéma RBAC minimal et explicite (rôles + permissions), appliqué CÔTÉ SERVEUR.
 *
 * On préfère un RBAC "maison" clair et versionné plutôt qu'un package opaque :
 *   - roles            : Visiteur (implicite = non connecté), tenant, owner, admin
 *   - permissions      : capacités atomiques (ex. "listings.create")
 *   - permission_role  : quelles permissions possède un rôle
 *   - role_user        : quels rôles possède un utilisateur (un compte peut cumuler
 *                        tenant + owner et basculer entre les deux espaces)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();          // Clé technique stable : tenant|owner|admin
            $table->string('label');                    // Libellé FR affiché à l'utilisateur
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();          // ex. listings.create, reports.moderate
            $table->string('label');
            $table->string('group')->nullable();        // Regroupement UI (ex. "listings")
            $table->timestamps();
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['permission_id', 'role_id']);
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
