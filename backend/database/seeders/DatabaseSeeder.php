<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Orchestrateur des seeders. L'ordre compte : le RBAC (rôles) doit exister
 * avant que les comptes de démo ne s'y rattachent.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,  // Rôles + permissions (référentiel RBAC)
            NeighborhoodSeeder::class,    // Quartiers de Dakar (+ points PostGIS)
            DemoUserSeeder::class,        // Comptes de test (dépend des rôles)
            ListingSeeder::class,         // Annonces de démo + comptes propriétaires
        ]);
    }
}
