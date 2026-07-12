<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * Fabrique de réponses JSON cohérentes pour toute l'API.
 *
 * Enveloppe stable, consommée telle quelle par le front :
 *   Succès  : { "data": ..., "message": ?string }
 *   Erreur  : { "message": string, "errors": ?object, "code": ?string }
 *
 * Centraliser ici garantit que TOUS les endpoints parlent le même langage,
 * ce qui simplifie la gestion d'erreurs côté React.
 */
class ApiResponse
{
    /** Réponse de succès. */
    public static function success(mixed $data = null, ?string $message = null, int $status = 200): JsonResponse
    {
        $payload = ['data' => $data];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        return response()->json($payload, $status);
    }

    /** Réponse d'erreur générique (message + éventuels détails de validation). */
    public static function error(
        string $message,
        int $status = 400,
        ?array $errors = null,
        ?string $code = null,
    ): JsonResponse {
        $payload = ['message' => $message];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        if ($code !== null) {
            $payload['code'] = $code;
        }

        return response()->json($payload, $status);
    }
}
