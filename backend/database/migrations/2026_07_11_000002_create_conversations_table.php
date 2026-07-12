<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fil de discussion entre un locataire et un propriétaire, généralement au sujet
 * d'une annonce précise. On matérialise la conversation (plutôt que de dériver
 * des messages) pour lister rapidement les échanges d'un utilisateur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();

            // Annonce concernée (contexte de l'échange) — facultative.
            $table->foreignId('listing_id')->nullable()->constrained('listings')->nullOnDelete();

            // Les deux participants. tenant = celui qui contacte, owner = le bailleur.
            $table->foreignId('tenant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();

            // Pour trier les conversations par activité récente sans agréger les messages.
            $table->timestamp('last_message_at')->nullable();

            $table->timestamps();

            // Un seul fil par trio (annonce, locataire, propriétaire).
            $table->unique(['listing_id', 'tenant_id', 'owner_id']);
            $table->index('tenant_id');
            $table->index('owner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
