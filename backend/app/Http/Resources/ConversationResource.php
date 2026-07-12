<?php

namespace App\Http\Resources;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Fil de discussion vu du point de vue de l'utilisateur connecté : on expose
 * « l'autre » participant plutôt que les deux, et un compteur de non-lus.
 *
 * @mixin Conversation
 */
class ConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $me = $request->user()?->id;
        $other = $this->counterpart($me);
        $last = $this->messages->last();

        return [
            'id' => $this->id,
            'listing' => $this->whenLoaded('listing', fn () => $this->listing ? [
                'id' => $this->listing->id,
                'title' => $this->listing->title,
                'image' => $this->listing->images[0] ?? null,
            ] : null),
            'counterpart' => $other ? [
                'id' => $other->id,
                'name' => $other->name,
                'is_verified' => $other->verification_status === 'verified',
            ] : null,
            'last_message' => $last ? [
                'body' => $last->body,
                'created_at' => $last->created_at,
                'mine' => $last->sender_id === $me,
            ] : null,
            'unread' => $this->messages
                ->where('sender_id', '!=', $me)
                ->whereNull('read_at')
                ->count(),
            'last_message_at' => $this->last_message_at,
        ];
    }
}
