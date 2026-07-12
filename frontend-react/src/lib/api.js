/* =====================================================================
   TerangaLoc — Client API (Laravel + Sanctum)
   ---------------------------------------------------------------------
   SEUL point de contact avec l'API. Toute l'application passe par ce
   module ; aucun composant ne fait de fetch/axios direct.

   Enveloppe backend (App\Support\ApiResponse) :
     • Succès : { data, message? }
     • Erreur : { message, errors?, code? }

   Auth : token Bearer (Sanctum) stocké dans localStorage.
   ===================================================================== */
import axios from 'axios';

const TOKEN_KEY = 'teranga_token';
const USER_KEY = 'teranga_user';

/* ---------- Stockage local du token + de l'utilisateur ---------- */
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const userStore = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },
  set: (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => localStorage.removeItem(USER_KEY),
};

/* ---------- Instance axios ---------- */
const http = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api') + '/v1',
  headers: { Accept: 'application/json' },
  timeout: 15000,
});

// Injecte le token sur chaque requête.
http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Purge la session locale si le serveur rejette l'authentification.
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      userStore.clear();
    }
    return Promise.reject(normalizeError(error));
  },
);

/**
 * Normalise n'importe quelle erreur axios en objet exploitable par l'UI :
 *   { message, errors?, status?, network? }
 */
export function normalizeError(error) {
  if (error?.response) {
    const d = error.response.data || {};
    return {
      status: error.response.status,
      message: d.message || 'Une erreur est survenue.',
      errors: d.errors || null,
      code: d.code || null,
    };
  }
  // Pas de réponse = backend éteint / CORS / réseau.
  return {
    network: true,
    message:
      'Connexion au serveur impossible. Vérifiez que le backend Laravel est démarré (php artisan serve).',
  };
}

// Déballe l'enveloppe { data } ; renvoie directement le contenu utile.
const unwrap = (res) => res.data?.data;

/* ===================================================================
   Authentification
   =================================================================== */
export async function register(input) {
  const body = {
    ...input,
    password_confirmation: input.password_confirmation ?? input.password,
    device_name: navigator.userAgent.slice(0, 100),
  };
  const data = unwrap(await http.post('/auth/register', body));
  saveSession(data);
  return data; // { user, token }
}

export async function login(input) {
  const body = { ...input, device_name: navigator.userAgent.slice(0, 100) };
  const data = unwrap(await http.post('/auth/login', body));
  saveSession(data);
  return data; // { user, token }
}

export async function me() {
  const user = unwrap(await http.get('/auth/me'));
  userStore.set(user);
  return user;
}

export async function logout() {
  try {
    await http.post('/auth/logout');
  } catch {
    /* on déconnecte localement même si l'appel échoue */
  } finally {
    tokenStore.clear();
    userStore.clear();
  }
}

export async function forgotPassword(email) {
  return unwrap(await http.post('/auth/forgot-password', { email }));
}

function saveSession(payload) {
  if (payload?.token) tokenStore.set(payload.token);
  if (payload?.user) userStore.set(payload.user);
}

/* ===================================================================
   Profil (authentifié)
   =================================================================== */
export async function updateProfile(patch) {
  const user = unwrap(await http.patch('/profile', patch));
  if (user) userStore.set(user);
  return user;
}

export async function enableOwnerSpace() {
  const user = unwrap(await http.post('/profile/enable-owner'));
  if (user) userStore.set(user);
  return user;
}

/* ===================================================================
   Référentiels publics
   =================================================================== */
export async function neighborhoods() {
  return unwrap(await http.get('/neighborhoods')); // [{id, name, city, ...}]
}

/* ===================================================================
   Annonces
   =================================================================== */
export async function searchListings(params = {}) {
  // Nettoie les paramètres vides avant l'envoi.
  const clean = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== '' && v !== null && v !== undefined) clean[k] = v;
  }
  return unwrap(await http.get('/listings', { params: clean })); // { items, meta }
}

export async function getListing(id) {
  return unwrap(await http.get(`/listings/${id}`));
}

export async function myListings() {
  return unwrap(await http.get('/my-listings'));
}

export async function createListing(payload) {
  return unwrap(await http.post('/listings', payload));
}

export async function updateListing(id, payload) {
  return unwrap(await http.patch(`/listings/${id}`, payload));
}

export async function deleteListing(id) {
  return unwrap(await http.delete(`/listings/${id}`));
}

/**
 * Téléverse une liste de fichiers image et renvoie leurs URLs publiques.
 * @param {File[]} files
 * @returns {Promise<string[]>} URLs des photos stockées
 */
export async function uploadPhotos(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append('photos[]', f));
  const res = await http.post('/uploads', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data?.urls || [];
}

/* ===================================================================
   Messagerie
   =================================================================== */
export async function getConversations() {
  return unwrap(await http.get('/conversations'));
}

export async function startConversation(listingId, body) {
  return unwrap(await http.post('/conversations', { listing_id: listingId, body }));
}

export async function getMessages(conversationId) {
  return unwrap(await http.get(`/conversations/${conversationId}/messages`));
}

export async function sendMessage(conversationId, body) {
  return unwrap(await http.post(`/conversations/${conversationId}/messages`, { body }));
}

export default http;
