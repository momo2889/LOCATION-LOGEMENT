<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Journal d'audit des actions sensibles (traçabilité / anti-fraude).
 *
 * Chaque action critique (connexion, changement de statut, modération, accès à un
 * document privé…) y laisse une trace immuable. Volontairement append-only :
 * pas de updated_at, on n'édite jamais une ligne d'audit.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // Auteur de l'action (nullable : action système ou utilisateur supprimé).
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('action');                       // ex. auth.login, listing.published
            $table->nullableMorphs('auditable');            // Cible polymorphe (listing, user…)
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->json('metadata')->nullable();           // Contexte additionnel (jamais de secret)

            $table->timestamp('created_at')->useCurrent();

            $table->index(['action', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
