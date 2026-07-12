<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Messagerie : conversations et messages entre locataires et propriétaires.
 *
 * Toutes les routes exigent une session. L'accès à un fil est strictement
 * réservé à ses deux participants (vérifié à chaque appel côté serveur).
 */
class MessageController extends Controller
{
    /** Liste des conversations de l'utilisateur connecté (locataire OU propriétaire). */
    public function index(Request $request): JsonResponse
    {
        $me = $request->user()->id;

        $conversations = Conversation::query()
            ->with(['listing', 'tenant', 'owner', 'messages'])
            ->where('tenant_id', $me)
            ->orWhere('owner_id', $me)
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->get();

        return ApiResponse::success(
            ConversationResource::collection($conversations)->resolve(),
        );
    }

    /**
     * Ouvre (ou récupère) la conversation avec le propriétaire d'une annonce.
     * Idempotent : un même trio (annonce, locataire, propriétaire) = un seul fil.
     */
    public function start(Request $request): JsonResponse
    {
        $data = $request->validate([
            'listing_id' => ['required', 'integer', 'exists:listings,id'],
            'body' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ]);

        $listing = Listing::findOrFail($data['listing_id']);
        $me = $request->user();

        if ($listing->owner_id === $me->id) {
            return ApiResponse::error('Vous ne pouvez pas contacter votre propre annonce.', 422);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'listing_id' => $listing->id,
                'tenant_id' => $me->id,
                'owner_id' => $listing->owner_id,
            ],
            ['last_message_at' => now()],
        );

        // Message initial facultatif (ex. « Bonjour, ce logement est-il disponible ? »).
        if (! empty($data['body'])) {
            $this->appendMessage($conversation, $me->id, $data['body']);
        }

        $conversation->load(['listing', 'tenant', 'owner', 'messages']);

        return ApiResponse::success(new ConversationResource($conversation), 'Conversation ouverte.', 201);
    }

    /** Messages d'un fil (marque comme lus ceux reçus par l'utilisateur). */
    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $me = $request->user()->id;

        if (! $conversation->hasParticipant($me)) {
            return ApiResponse::error('Conversation introuvable.', 404);
        }

        // Accusé de lecture : tous les messages de l'autre deviennent « lus ».
        $conversation->messages()
            ->where('sender_id', '!=', $me)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()->with('sender')->get();

        return ApiResponse::success(MessageResource::collection($messages)->resolve());
    }

    /** Envoi d'un message dans un fil existant. */
    public function send(Request $request, Conversation $conversation): JsonResponse
    {
        $me = $request->user()->id;

        if (! $conversation->hasParticipant($me)) {
            return ApiResponse::error('Conversation introuvable.', 404);
        }

        $data = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:5000'],
        ]);

        $message = $this->appendMessage($conversation, $me, $data['body']);

        return ApiResponse::success(new MessageResource($message), null, 201);
    }

    /** Insère un message et rafraîchit l'horodatage d'activité du fil. */
    private function appendMessage(Conversation $conversation, int $senderId, string $body): Message
    {
        $message = $conversation->messages()->create([
            'sender_id' => $senderId,
            'body' => $body,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return $message;
    }
}
