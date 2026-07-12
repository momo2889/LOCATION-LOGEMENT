<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Endpoint d'observabilité : /api/health
 *
 * Vérifie que l'application ET ses dépendances critiques répondent
 * (connexion PostgreSQL + disponibilité de l'extension PostGIS).
 * Renvoie 200 si tout est OK, 503 sinon — exploitable par un load balancer.
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks = [
            'database' => $this->check(fn () => DB::select('select 1')),
            'postgis' => $this->check(fn () => DB::select('select postgis_version()')),
        ];

        $healthy = collect($checks)->every(fn ($c) => $c['ok']);

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'app' => config('app.name'),
            'time' => now()->toIso8601String(),
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }

    /**
     * Exécute une sonde et renvoie son état sans jamais lever d'exception.
     *
     * @param  callable():mixed  $probe
     * @return array{ok: bool, error?: string}
     */
    private function check(callable $probe): array
    {
        try {
            $probe();

            return ['ok' => true];
        } catch (Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
}
