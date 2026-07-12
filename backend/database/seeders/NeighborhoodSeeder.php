<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Quartiers réels de Dakar avec leurs coordonnées approximatives (lat, lng).
 * Le point PostGIS `center` est écrit via ST_MakePoint pour valider la chaîne
 * géospatiale de bout en bout dès la Phase 1.
 */
class NeighborhoodSeeder extends Seeder
{
    /** [nom, latitude, longitude] — centres approximatifs. */
    private const NEIGHBORHOODS = [
        ['Plateau',      14.6690, -17.4390],
        ['Médina',       14.6800, -17.4520],
        ['Fann',         14.6870, -17.4620],
        ['Point E',      14.6930, -17.4590],
        ['Mermoz',       14.7040, -17.4720],
        ['Sacré-Cœur',   14.7130, -17.4640],
        ['Almadies',     14.7440, -17.5170],
        ['Ngor',         14.7490, -17.5130],
        ['Yoff',         14.7560, -17.4880],
        ['Ouakam',       14.7220, -17.4930],
        ['Grand Yoff',   14.7360, -17.4620],
        ['Parcelles Assainies', 14.7680, -17.4360],
        ['Liberté 6',    14.7220, -17.4560],
        ['HLM',          14.7080, -17.4470],
        ['Sicap Baobab', 14.7000, -17.4560],
    ];

    public function run(): void
    {
        foreach (self::NEIGHBORHOODS as [$name, $lat, $lng]) {
            $slug = Str::slug($name);

            // upsert manuel : on évite les doublons si le seeder est rejoué.
            $exists = DB::table('neighborhoods')->where('slug', $slug)->exists();
            if ($exists) {
                continue;
            }

            DB::table('neighborhoods')->insert([
                'name' => $name,
                'city' => 'Dakar',
                'region' => 'Dakar',
                'country' => 'SN',
                'slug' => $slug,
                // ST_MakePoint attend (longitude, latitude) — ordre X, Y.
                'center' => DB::raw("ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography"),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
