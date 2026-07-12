<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Fil de discussion entre un locataire et un propriétaire, au sujet d'une annonce.
 */
class Conversation extends Model
{
    protected $fillable = ['listing_id', 'tenant_id', 'owner_id', 'last_message_at'];

    protected function casts(): array
    {
        return ['last_message_at' => 'datetime'];
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** L'utilisateur fait-il partie de ce fil ? (garde d'accès). */
    public function hasParticipant(int $userId): bool
    {
        return $this->tenant_id === $userId || $this->owner_id === $userId;
    }

    /** L'autre participant, du point de vue de $userId. */
    public function counterpart(int $userId): ?User
    {
        return $this->tenant_id === $userId ? $this->owner : $this->tenant;
    }
}
