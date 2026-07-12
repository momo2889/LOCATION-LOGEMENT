<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Annonce de logement.
 *
 * Le tri « Premium d'abord » (annonces boostées via abonnement propriétaire)
 * est appliqué au niveau des requêtes de recherche — il reste invisible pour le
 * visiteur (aucun badge exposé côté front).
 */
class Listing extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'owner_id', 'neighborhood_id', 'title', 'slug', 'description', 'type',
        'price', 'rooms', 'bathrooms', 'area', 'furnished', 'duration',
        'is_premium', 'rating', 'lat', 'lng', 'images', 'pano', 'status',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'furnished' => 'boolean',
            'is_premium' => 'boolean',
            'price' => 'integer',
            'rooms' => 'integer',
            'bathrooms' => 'integer',
            'area' => 'integer',
            'rating' => 'float',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    // ---------------------------------------------------------------------
    // Relations
    // ---------------------------------------------------------------------

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function neighborhood(): BelongsTo
    {
        return $this->belongsTo(Neighborhood::class);
    }
}
