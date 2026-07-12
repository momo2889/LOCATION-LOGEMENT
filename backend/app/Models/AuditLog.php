<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Entrée du journal d'audit. Append-only : pas de timestamp updated_at.
 * Créée exclusivement via App\Support\Audit::log() pour rester cohérente.
 */
class AuditLog extends Model
{
    public const UPDATED_AT = null; // Jamais mis à jour

    protected $fillable = [
        'user_id', 'action', 'auditable_type', 'auditable_id',
        'ip_address', 'user_agent', 'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }
}
