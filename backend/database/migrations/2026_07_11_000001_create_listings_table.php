<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Annonces de logement (le cœur métier de TerangaLoc).
 *
 * Une annonce appartient à un propriétaire (users) et se situe dans un quartier
 * (neighborhoods). Les coordonnées `lat`/`lng` sont stockées en décimal : elles
 * suffisent à l'affichage carte et aux filtres. La recherche par rayon PostGIS
 * reste possible en réutilisant le point `center` du quartier (déjà indexé GIST).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();

            // Propriétaire de l'annonce (rôle owner). Si le compte est supprimé,
            // ses annonces le sont aussi.
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();

            // Quartier de rattachement (référentiel). On garde l'annonce même si
            // le quartier venait à être retiré du référentiel.
            $table->foreignId('neighborhood_id')->nullable()->constrained('neighborhoods')->nullOnDelete();

            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Studio | Chambre | Appartement | Villa
            $table->string('type', 32);

            $table->unsignedInteger('price');          // FCFA / mois
            $table->unsignedSmallInteger('rooms');     // chambres
            $table->unsignedSmallInteger('bathrooms'); // salles de bain
            $table->unsignedSmallInteger('area');      // surface m²

            $table->boolean('furnished')->default(false);
            $table->string('duration', 16)->default('longue'); // courte | longue

            // Annonce boostée via abonnement propriétaire : influence UNIQUEMENT
            // le classement (Premium d'abord), de façon invisible pour le visiteur.
            $table->boolean('is_premium')->default(false);

            $table->decimal('rating', 2, 1)->default(0);

            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();

            // Galerie de photos + panorama 360° d'intérieur.
            $table->json('images')->nullable();
            $table->string('pano')->nullable();

            // published : visible dans la recherche. draft : brouillon propriétaire.
            $table->string('status', 16)->default('published');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'is_premium']);
            $table->index('type');
            $table->index('price');
            $table->index('neighborhood_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
