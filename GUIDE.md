# Guide d'utilisation — TerangaLoc

TerangaLoc est une plateforme de **location de logements au Sénégal** : annonces
vérifiées, recherche par quartier/prix/type, visite immersive 360°, messagerie
propriétaire ↔ locataire et offres de visibilité **Premium** pour les bailleurs.

Ce guide couvre **tout, de A à Z** : installation, démarrage, et utilisation de
chaque fonctionnalité.

---

## 1. Architecture du projet

```
terangaloc/
├── backend/                 API Laravel (PHP) — authentification, quartiers, profils
├── frontend/                Site principal (HTML/CSS/JS statique) ← l'application
│   ├── accueil.html         Page d'accueil + recherche
│   ├── recherche.html       Résultats + carte + filtres
│   ├── logement.html        Fiche d'un logement + visite 360°
│   ├── publier.html         Publier une annonce (propriétaire)
│   ├── connexion.html       Connexion / Inscription
│   ├── tableau-de-bord.html Espace personnel
│   ├── messagerie.html      Messagerie
│   ├── abonnement.html      Offres Premium
│   └── assets/              api.js, app.js, theme.css, pano/ (panoramas 360°)
├── frontend-react-legacy/   Ancienne version React (archivée, non utilisée)
└── docker-compose.yml       Base de données PostgreSQL + Mailpit
```

---

## 2. Prérequis

À installer une seule fois sur la machine :

- **PHP 8.2+** et **Composer** (pour le backend Laravel)
- **Docker Desktop** (pour la base de données PostgreSQL)
- **VS Code** avec l'extension **Live Server** (pour servir le site), ou tout
  serveur statique (`php -S`, `npx http-server`…)
- Un navigateur récent (Chrome, Edge, Firefox)

---

## 3. Installation (première fois)

### a) Récupérer le projet
```bash
git clone https://github.com/momo2889/LOCATION-LOGEMENT.git
cd LOCATION-LOGEMENT
```

### b) Base de données (Docker)
```bash
docker compose up -d
```
Cela démarre PostgreSQL (port 5433) et Mailpit (emails de test sur http://localhost:8025).

### c) Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env          # créer le fichier d'environnement
php artisan key:generate      # générer la clé de l'application
php artisan migrate --seed    # créer les tables + données de démo
```

### d) Frontend
Aucune installation : c'est un site statique. Rien à compiler.

---

## 4. Démarrer l'application (chaque session)

Ouvrir **3 choses** :

1. **La base de données** (si pas déjà lancée) :
   ```bash
   docker compose up -d
   ```

2. **Le serveur backend** (dans `backend/`) :
   ```bash
   php artisan serve
   ```
   → API disponible sur http://127.0.0.1:8000

3. **Le site** (dans `frontend/`) :
   - VS Code : clic droit sur `accueil.html` → **Open with Live Server**
   - ou en ligne de commande : `php -S 127.0.0.1:5500` puis ouvrir
     http://127.0.0.1:5500/accueil.html

> ⚠️ Toujours passer par un serveur (http://…), **jamais** en `file://`,
> sinon les appels à l'API sont bloqués.

---

## 5. Comptes de démonstration

Créés par `php artisan migrate --seed`. Mot de passe commun : **`Password123!`**

| Rôle | Email |
|------|-------|
| Locataire | `locataire@terangaloc.sn` |
| Propriétaire | `proprietaire@terangaloc.sn` |
| Admin | `admin@terangaloc.sn` |

Tu peux aussi créer un nouveau compte depuis la page **Connexion → Inscription**.

---

## 6. Utilisation, fonctionnalité par fonctionnalité

### 🏠 Accueil (`accueil.html`)
- Barre de recherche : choisis un **quartier**, un **type** et un **budget max**,
  puis clique **Rechercher** → tu arrives sur les résultats déjà filtrés.
- Section « Logements vedettes » : les annonces **Premium** puis les mieux notées.

### 🔍 Recherche (`recherche.html`)
- Filtres en haut : texte (quartier/type), **type**, **budget max**, **durée**
  (longue/courte), et **tri** (pertinence, prix, surface).
- La **carte** (à droite) affiche les prix ; survoler une annonce met en
  évidence son point sur la carte.
- Les annonces **Premium ⭐** apparaissent en tête (tri « pertinence »).

### 🖼️ Fiche logement (`logement.html`)
- Ouverte en cliquant sur une annonce.
- **Visite immersive 360°** : fais glisser dans l'image pour explorer l'intérieur ;
  bouton plein écran pour l'effet casque VR.
- Galerie de photos, caractéristiques (chambres, surface, meublé…), description.
- Bouton **« Contacter le propriétaire »** → ouvre la messagerie avec un message
  pré-rempli au sujet de ce logement.

### 👤 Connexion / Inscription (`connexion.html`)
- **Connexion** : email + mot de passe.
- **Inscription** : choisis ton espace (**Locataire** 🔑 ou **Propriétaire** 🏠),
  puis renseigne nom, email, téléphone et mot de passe (8 caractères min., avec
  majuscule, minuscule et chiffre).
- Une fois connecté, ton nom et un bouton **Déconnexion** apparaissent dans le menu.

### 📊 Tableau de bord (`tableau-de-bord.html`)
- Accès réservé aux personnes connectées (sinon redirection vers la connexion).
- Salutation personnalisée + statistiques et graphiques de tes annonces.

### 💬 Messagerie (`messagerie.html`)
- Liste des conversations à gauche, discussion à droite.
- En arrivant depuis une fiche logement, une conversation avec le propriétaire
  concerné est ouverte automatiquement.

### ➕ Publier une annonce (`publier.html`)
- Réservé aux personnes connectées.
- Formulaire en 3 étapes : **Informations** (titre, type, quartier, loyer…),
  **Photos & 360°**, puis **Vérification** et envoi.
- La liste des **quartiers** est chargée depuis le backend.

### ⭐ Abonnement Premium (`abonnement.html`)
- 3 offres : **Gratuit**, **Premium**, **Pro/Agence**.
- L'abonnement Premium met les annonces **en avant** (en tête des résultats) avec
  un badge doré → plus de visibilité, plus de contacts.
- Bascule mensuel / annuel pour voir les tarifs.

### 🌙 Confort
- Bouton **🌙 / ☀️** dans le menu : thème clair / sombre (mémorisé).
- **Ctrl + K** : recherche rapide (pages, quartiers, logements).
- Cœur 🤍 sur une annonce : ajouter aux favoris.

---

## 7. Ce qui est réel vs. démonstration

**Branché au backend (données réelles, persistantes) :**
- Inscription, connexion, déconnexion, mot de passe oublié
- Tableau de bord personnalisé (utilisateur connecté)
- Liste des quartiers

**Encore en données de démonstration** (le backend correspondant reste à
construire) :
- Les logements (recherche, fiche, publication) et la messagerie utilisent des
  données d'exemple locales.
- L'abonnement Premium et le paiement sont une démonstration (paiement Wave /
  Orange Money / carte à intégrer plus tard).

---

## 8. Dépannage

| Problème | Solution |
|----------|----------|
| Le site ne se connecte pas / erreur réseau | Vérifier que `php artisan serve` tourne (port 8000) |
| « connection refused » sur la base | Lancer `docker compose up -d` et attendre que la base soit prête |
| Les appels API sont bloqués (CORS) | Servir le site via http:// (pas `file://`) ; le CORS autorise déjà tout `localhost` |
| Photos manquantes | Simple souci réseau Unsplash ; une image de remplacement s'affiche |
| Après modif de config Laravel | `php artisan config:clear` |

---

## 9. Adresses utiles (en local)

- Site : http://127.0.0.1:5500/accueil.html
- API : http://127.0.0.1:8000/api
- Emails de test (Mailpit) : http://localhost:8025
