/* Utilitaires partagés (format, favoris). */

/** Formate un montant en FCFA avec séparateurs de milliers. */
export const fcfa = (n) => Number(n || 0).toLocaleString('fr-FR');

/** Rendu court d'une date (ex. « il y a 3 h »). */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 7) return `il y a ${j} j`;
  return d.toLocaleDateString('fr-FR');
}

/* ---------- Favoris (persistants en localStorage) ---------- */
const FAV_KEY = 'tl_favs';

export const favorites = {
  all() {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    } catch {
      return [];
    }
  },
  has(id) {
    return this.all().includes(id);
  },
  toggle(id) {
    let f = this.all();
    f = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
    localStorage.setItem(FAV_KEY, JSON.stringify(f));
    return f.includes(id);
  },
};
