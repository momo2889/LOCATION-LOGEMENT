<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Sème le référentiel RBAC : permissions atomiques, rôles, et l'association
 * rôle → permissions. Idempotent (updateOrCreate) : on peut le rejouer sans
 * créer de doublons. C'est LA source de vérité des autorisations serveur.
 */
class RolePermissionSeeder extends Seeder
{
    /**
     * Catalogue des permissions : name => [group, label].
     * Elles couvrent les modules prévus (certaines ne seront réellement
     * utilisées qu'aux phases suivantes, mais le référentiel est posé tôt).
     */
    private const PERMISSIONS = [
        // Annonces
        'listings.create'      => ['listings', 'Créer une annonce'],
        'listings.update'      => ['listings', 'Modifier ses annonces'],
        'listings.delete'      => ['listings', 'Supprimer ses annonces'],
        'listings.publish'     => ['listings', 'Publier / dépublier ses annonces'],
        'listings.moderate'    => ['listings', 'Modérer toutes les annonces'],
        // Candidatures / réservations
        'applications.apply'   => ['applications', 'Candidater à une annonce'],
        'applications.review'  => ['applications', 'Traiter les candidatures reçues'],
        'bookings.book'        => ['bookings', 'Réserver des dates'],
        'bookings.manage'      => ['bookings', 'Gérer les réservations reçues'],
        // Documents
        'documents.upload'     => ['documents', 'Déposer ses documents'],
        'documents.review'     => ['documents', 'Consulter le dossier des candidats'],
        // Messagerie
        'messages.participate' => ['messages', 'Échanger via la messagerie'],
        // Avis & signalements
        'reviews.write'        => ['reviews', 'Laisser un avis'],
        'reports.create'       => ['reports', 'Signaler une annonce / un utilisateur'],
        'reports.moderate'     => ['reports', 'Traiter la file de modération'],
        // Administration
        'admin.access'         => ['admin', "Accéder à l'espace d'administration"],
        'users.manage'         => ['admin', 'Gérer les utilisateurs'],
        'roles.manage'         => ['admin', 'Gérer les rôles et permissions'],
        'stats.view'           => ['admin', 'Consulter les statistiques'],
    ];

    /** Rôles et libellés affichés à l'utilisateur. */
    private const ROLES = [
        Role::TENANT => ['Locataire', 'Recherche un logement et candidate / réserve.'],
        Role::OWNER  => ['Propriétaire', 'Publie et gère ses logements et les demandes reçues.'],
        Role::ADMIN  => ['Administrateur', 'Gère la plateforme, la modération et les accès.'],
    ];

    /** Permissions par rôle. L'admin reçoit TOUT le catalogue. */
    private const ROLE_PERMISSIONS = [
        Role::TENANT => [
            'applications.apply', 'bookings.book', 'documents.upload',
            'messages.participate', 'reviews.write', 'reports.create',
        ],
        Role::OWNER => [
            'listings.create', 'listings.update', 'listings.delete', 'listings.publish',
            'applications.review', 'bookings.manage', 'documents.review',
            'messages.participate', 'reviews.write', 'reports.create',
        ],
        // Role::ADMIN => géré dynamiquement ci-dessous (toutes les permissions).
    ];

    public function run(): void
    {
        // 1. Permissions
        $permissions = [];
        foreach (self::PERMISSIONS as $name => [$group, $label]) {
            $permissions[$name] = Permission::updateOrCreate(
                ['name' => $name],
                ['group' => $group, 'label' => $label],
            );
        }

        // 2. Rôles + attachement des permissions
        foreach (self::ROLES as $name => [$label, $description]) {
            $role = Role::updateOrCreate(
                ['name' => $name],
                ['label' => $label, 'description' => $description],
            );

            $granted = $name === Role::ADMIN
                ? array_keys(self::PERMISSIONS)               // admin = toutes les permissions
                : (self::ROLE_PERMISSIONS[$name] ?? []);

            $ids = collect($granted)->map(fn ($p) => $permissions[$p]->id)->all();
            $role->permissions()->sync($ids);                 // sync = état déclaratif exact
        }
    }
}
