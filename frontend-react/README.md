# TerangaLoc — Frontend React

Application **React (Vite, JavaScript)** dynamique qui consomme l'API Laravel du
dossier [`../backend`](../backend). C'est la nouvelle version du front (l'ancien
site statique reste dans [`../frontend`](../frontend) à titre de référence).

## Démarrer en local

Il faut **3 choses** en marche : la base de données, le backend, puis ce front.

### 1. Base de données (PostgreSQL + PostGIS + Mailpit)

À la racine du projet :

```bash
docker compose up -d
```

### 2. Backend Laravel (API sur http://127.0.0.1:8000)

Dans [`../backend`](../backend) :

```bash
php artisan migrate --seed   # 1re fois seulement (crée les tables + données de démo)
php artisan serve
```

### 3. Ce frontend (http://127.0.0.1:5173)

Dans ce dossier :

```bash
npm install     # 1re fois seulement
npm run dev
```

Puis ouvrir **http://127.0.0.1:5173**.

> C'est la commande `npm run dev` qui manquait dans l'ancien dossier `frontend/` :
> elle n'existe que dans un vrai projet React comme celui-ci (avec `package.json`).

## Configuration

L'URL de l'API est lue depuis `.env` :

```
VITE_API_URL=http://127.0.0.1:8000/api
```

## Comptes de démonstration

Mot de passe commun : `Password123!`

| Rôle | Email |
|------|-------|
| Locataire | `locataire@terangaloc.sn` |
| Propriétaire | `proprietaire@terangaloc.sn` |
| Mixte (locataire + propriétaire) | `mixte@terangaloc.sn` |
| Admin | `admin@terangaloc.sn` |

Les propriétaires des annonces de démo sont aussi de vrais comptes
(ex. `awa.diallo@bailleurs.terangaloc.sn`), utiles pour tester la messagerie.

## Structure

```
src/
  lib/
    api.js          Client API unique (auth, annonces, messagerie…)
    utils.js        Format FCFA, favoris, dates
  context/
    AuthContext     Session + rôles (revalidée via /auth/me)
    ThemeContext    Thème clair/sombre
    ToastContext    Notifications
  components/
    Layout, Header, Footer, ProtectedRoute,
    ListingCard, CommandPalette (Ctrl+K), Reveal, Spinner
  pages/
    HomePage, SearchPage, ListingPage, LoginPage, PublishPage,
    DashboardPage, MessagesPage, SubscriptionPage, ProfilePage,
    ContactPage, NotFoundPage
  styles/
    theme.css       Design system (repris du site statique)
    app.css         Styles par page (scopés .p-home, .p-search…)
```

## Ce qui est branché au backend ✅

| Fonctionnalité | Endpoints |
|----------------|-----------|
| Connexion / inscription / mot de passe oublié | `POST /auth/login`, `/auth/register`, `/auth/forgot-password` |
| Session & rôles | `GET /auth/me`, `POST /auth/logout` |
| Profil + activation espace propriétaire | `PATCH /profile`, `POST /profile/enable-owner` |
| Recherche & détail des annonces | `GET /listings`, `GET /listings/{id}` |
| Publier / modifier / supprimer (propriétaire) | `POST/PATCH/DELETE /listings` |
| Mes annonces (tableau de bord) | `GET /my-listings` |
| Messagerie locataire ⇄ propriétaire | `GET/POST /conversations`, `/conversations/{id}/messages` |
| Référentiel quartiers | `GET /neighborhoods` |

Le token Sanctum est stocké dans `localStorage` (`teranga_token`).

## Librairies externes (CDN, dans `index.html`)

- **Leaflet** — carte de la page Recherche
- **Pannellum** — visite immersive 360° de la page Détail
- **Chart.js** — graphiques du tableau de bord
