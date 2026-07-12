<?php

namespace App\Support;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Point d'entrée unique pour journaliser les actions sensibles.
 *
 * Écrit à la fois :
 *   - dans la table `audit_logs` (traçabilité structurée, requêtable par l'admin) ;
 *   - dans le canal de logs `audit` (fichier, pour l'observabilité / le SIEM).
 *
 * La journalisation ne doit JAMAIS faire échouer l'action métier : toute erreur
 * d'écriture d'audit est capturée et loggée, sans propagation.
 */
class Audit
{
    /**
     * @param  string  $action    Verbe canonique, ex. "auth.login", "listing.published"
     * @param  Model|null  $subject  Entité concernée (cible polymorphe)
     * @param  array<string, mixed>  $metadata  Contexte additionnel (jamais de secret/mot de passe)
     * @param  User|null  $actor    Auteur ; par défaut l'utilisateur authentifié
     */
    public static function log(
        string $action,
        ?Model $subject = null,
        array $metadata = [],
        ?User $actor = null,
    ): void {
        $actor ??= Auth::user();
        $request = request();

        try {
            AuditLog::create([
                'user_id' => $actor?->getKey(),
                'action' => $action,
                'auditable_type' => $subject ? $subject->getMorphClass() : null,
                'auditable_id' => $subject?->getKey(),
                'ip_address' => $request?->ip(),
                'user_agent' => substr((string) $request?->userAgent(), 0, 512),
                'metadata' => $metadata ?: null,
            ]);

            Log::channel('audit')->info($action, [
                'user_id' => $actor?->getKey(),
                'subject' => $subject ? $subject->getMorphClass().'#'.$subject->getKey() : null,
                'ip' => $request?->ip(),
                'metadata' => $metadata,
            ]);
        } catch (Throwable $e) {
            // On ne casse jamais le flux métier à cause de l'audit.
            Log::error('Échec écriture audit', ['action' => $action, 'error' => $e->getMessage()]);
        }
    }
}
