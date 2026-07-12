<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Active l'extension PostGIS dès le départ : indispensable pour les colonnes
 * géographiques (recherche par rayon / proximité — cœur de l'app en Phase 3).
 * Sur l'image docker `postgis/postgis`, l'extension est déjà présente ; cette
 * migration garantit qu'une base recréée à zéro (migrate:fresh) reste cohérente.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis;');
    }

    public function down(): void
    {
        // On ne DROP pas l'extension : d'autres tables (neighborhoods, listings…)
        // en dépendent et la supprimer casserait la base.
    }
};
