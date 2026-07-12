# TerangaLoc — Plateforme de location de logements

> Plateforme de **mise en relation** entre propriétaires et locataires, pensée
> d'abord pour le marché sénégalais (Dakar) selon des standards internationaux :
> **confiance** (propriétaires vérifiés, signalement, avis), **fiabilité**,
> **mobile-first** et **multilingue**. **Aucun système de paiement** (hors périmètre).

Ce dépôt contient une **API Laravel** et un **front React**, orchestrés avec
**PostgreSQL + PostGIS** (recherche géospatiale) via Docker.

---

## 📦 Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + TypeScript (Vite), React Router, react-i18next |
| Backend | Laravel 12 (API REST `/api/v1`), Sanctum (tokens) |
| Base de données | PostgreSQL 16 + PostGIS 3.4 |
| Emails (dev) | Mailpit |
| Infra dev | Docker Compose |

---

## 🗂️ Structure du projet

```
terangaloc/
├── docker-compose.yml        # PostgreSQL/PostGIS + Mailpit
├── README.md                 # ce fichier
├── backend/                  # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/        # HealthController + V1/ (Auth, Profile, Neighborhood)
│   │   │   ├── Middleware/             # EnsureHasRole, EnsureHasPermission (RBAC serveur)
│   │   │   ├── Requests/Auth/          # Validation (Register, Login, Reset…)
│   │   │   └── Resources/              # UserResource (sérialisation sûre)
│   │   ├── Models/                     # User, Role, Permission, Neighborhood, AuditLog
│   │   └── Support/                    # ApiResponse (réponses uniformes), Audit (journal)
│   ├── database/
│   │   ├── migrations/                 # users étendu, RBAC, PostGIS, neighborhoods, audit_logs
│   │   └── seeders/                    # RolePermission, Neighborhood (Dakar), DemoUser
│   ├── routes/api.php                  # routes /api/health et /api/v1/*
│   └── tests/Feature/                  # Health, Auth, Rbac
└── frontend/                 # SPA React
    └── src/
        ├── lib/api.ts                  # client axios (token, gestion erreurs réseau)
        ├── context/AuthContext.tsx     # état d'authentification global
        ├── components/                 # Layout, ProtectedRoute
        ├── pages/                      # Home, Login, Register, Dashboard, NotFound
        ├── i18n/                       # français (structure prête pour en/wo)
        └── index.css                   # design system (tokens + composants)
```

**Pourquoi cette organisation ?** Séparation nette back/front. Côté back, la
logique transversale (réponses API, audit, RBAC) est isolée dans des briques
réutilisables (`Support/`, `Middleware/`) pour rester cohérente à mesure que les
modules s'ajoutent. Côté front, un point d'entrée API unique et un contexte
d'auth centralisent la sécurité et la gestion d'erreurs.

---

## ✅ Prérequis

- **Docker Desktop** (démarré)
- **PHP 8.2+** avec les extensions `pdo_pgsql` et `pgsql` activées
- **Composer 2**
- **Node 18+** et **npm**

> Sur XAMPP, activez le driver Postgres dans `php.ini` en décommentant
> `extension=pdo_pgsql` et `extension=pgsql`, puis redémarrez le terminal.

---

## 🚀 Installation & lancement

### 1. Base de données (Docker)

```bash
# à la racine terangaloc/
docker compose up -d
```

Cela démarre PostgreSQL/PostGIS (port hôte **5433**) et Mailpit
(interface : http://localhost:8025).

### 2. Backend (Laravel)

```bash
cd backend
cp .env.example .env          # puis, si besoin :  php artisan key:generate
composer install
php artisan migrate --seed    # crée le schéma + données de démo
php artisan serve             # http://127.0.0.1:8000
```

### 3. Frontend (React)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://127.0.0.1:5173
```

Ouvrez **http://127.0.0.1:5173**.

---

## 👤 Comptes de test

Mot de passe commun : **`Password123!`**

| Rôle | Email | Particularité |
|---|---|---|
| Locataire | `locataire@terangaloc.sn` | non vérifié |
| Propriétaire | `proprietaire@terangaloc.sn` | vérifié |
| Administrateur | `admin@terangaloc.sn` | accès admin |
| Mixte (locataire + propriétaire) | `mixte@terangaloc.sn` | démontre la bascule d'espaces |

---

## 🔌 Endpoints principaux (Phase 1)

Base : `http://127.0.0.1:8000/api`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/health` | public | Santé de l'app (DB + PostGIS) |
| POST | `/v1/auth/register` | public | Inscription (+ token) |
| POST | `/v1/auth/login` | public | Connexion (+ token) |
| POST | `/v1/auth/forgot-password` | public | Envoi du lien de réinitialisation |
| POST | `/v1/auth/reset-password` | public | Réinitialisation du mot de passe |
| GET | `/v1/neighborhoods` | public | Quartiers (référentiel) |
| GET | `/v1/auth/me` | token | Profil courant |
| POST | `/v1/auth/logout` | token | Déconnexion (révoque le token) |
| PATCH | `/v1/profile` | token | Mise à jour du profil |
| POST | `/v1/profile/enable-owner` | token | Activer l'espace propriétaire |
| GET | `/v1/admin/ping` | **admin** | Exemple de zone protégée (RBAC) |

**Format de réponse uniforme**
- Succès : `{ "data": ..., "message"?: string }`
- Erreur : `{ "message": string, "errors"?: object, "code"?: string }`

Authentification : en-tête `Authorization: Bearer <token>`.

---

## 🧪 Tests

Les tests tournent sur une base PostgreSQL **dédiée** (`terangaloc_test`) car les
migrations utilisent PostGIS.

```bash
# une seule fois : créer la base de test
docker exec terangaloc_db psql -U terangaloc -d postgres -c "CREATE DATABASE terangaloc_test;"
docker exec terangaloc_db psql -U terangaloc -d terangaloc_test -c "CREATE EXTENSION IF NOT EXISTS postgis;"

cd backend
php artisan test
```

Parcours couverts : santé/PostGIS, inscription, connexion (succès + échec
générique + mot de passe faible), profil, et **RBAC côté serveur** (un
propriétaire ne peut pas atteindre une route admin).

---

## 🔐 Sécurité (déjà en place en Phase 1)

- Mots de passe hachés (bcrypt), politique de robustesse à l'inscription.
- **RBAC imposé côté serveur** (middlewares `role` / `permission`).
- Validation stricte des entrées (Form Requests).
- Anti-bruteforce sur la connexion (verrou email+IP + throttle de route).
- Réponses d'erreur uniformes, **sans fuite de stack trace** en production.
- **Journal d'audit** des actions sensibles (`audit_logs` + canal de logs `audit`).
- CORS restreint à l'origine du front.
- Tokens révoqués à la déconnexion et lors d'une réinitialisation de mot de passe.

---

## 🗺️ Feuille de route

- **Phase 1 — Socle ✅** : auth + RBAC, migrations de base, PostGIS, seeders,
  gestion d'erreurs/logs, santé, tests, i18n, design system.
- **Phase 2** : CRUD des annonces + upload photos + espace propriétaire.
- **Phase 3** : recherche (filtres + géospatiale PostGIS + carte).
- **Phase 4** : candidatures / réservations + calendrier + documents.
- **Phase 5** : messagerie + notifications.
- **Phase 6** : administration + modération + dashboard.
- **Phase 7** : finitions (i18n complet, sécurité renforcée, robustesse, doc).

---

## 💾 Sauvegarde de la base (dev)

```bash
docker exec terangaloc_db pg_dump -U terangaloc terangaloc > backup.sql
```
