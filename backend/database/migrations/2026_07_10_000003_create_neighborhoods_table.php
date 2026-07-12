<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Quartiers (référentiel de localisation).
 *
 * Table de référence pour la recherche par quartier (Plateau, Almadies, Ouakam…)
 * et point d'ancrage géographique. La colonne `center` est un point PostGIS
 * (geography/4326) : elle démontre et valide la chaîne géospatiale dès la Phase 1
 * et servira au tri par proximité en Phase 3.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('neighborhoods', function (Blueprint $table) {
            $table->id();
            $table->string('name');                 // ex. Almadies
            $table->string('city')->default('Dakar');
            $table->string('region')->default('Dakar');
            $table->string('country', 2)->default('SN'); // ISO 3166-1 alpha-2
            $table->string('slug')->unique();
            $table->timestamps();

            $table->index(['country', 'city']);
        });

        // Colonne géographique PostGIS ajoutée en SQL brut : type explicite
        // geography(Point,4326) + index GIST pour des recherches spatiales rapides.
        DB::statement('ALTER TABLE neighborhoods ADD COLUMN center geography(Point, 4326) NULL;');
        DB::statement('CREATE INDEX neighborhoods_center_gix ON neighborhoods USING GIST (center);');
    }

    public function down(): void
    {
        Schema::dropIfExists('neighborhoods');
    }
};
