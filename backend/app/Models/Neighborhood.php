<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Quartier (référentiel de localisation, ex. Almadies à Dakar).
 *
 * La colonne PostGIS `center` n'est volontairement pas déclarée dans $casts :
 * elle se manipule via des expressions SQL spatiales (ST_MakePoint, ST_Distance…)
 * qui seront ajoutées avec la recherche géospatiale en Phase 3.
 */
class Neighborhood extends Model
{
    protected $fillable = ['name', 'city', 'region', 'country', 'slug'];
}
