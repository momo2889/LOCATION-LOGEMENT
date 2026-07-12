import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw } from 'lucide-react';
import { searchListings } from '../lib/api';
import { fcfa } from '../lib/utils';
import ListingCard from '../components/ListingCard';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';

/** Recherche : filtres + résultats + carte Leaflet synchronisée. */
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();

  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    type: params.get('type') || '',
    budget: params.get('budget') || '0',
    duration: params.get('duration') || '',
    sort: params.get('sort') || 'recommended',
  });
  const [items, setItems] = useState(null);

  const mapRef = useRef(null); // instance Leaflet
  const markersRef = useRef({});

  // Initialise la carte une seule fois.
  useEffect(() => {
    if (!window.L || mapRef.current) return;
    const map = window.L.map('map', { scrollWheelZoom: false }).setView([14.71, -17.47], 12);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Recharge les résultats quand les filtres changent (debounce).
  useEffect(() => {
    const t = setTimeout(async () => {
      setItems(null);
      try {
        const apiParams = {
          q: filters.q,
          type: filters.type,
          budget: filters.budget !== '0' ? filters.budget : '',
          duration: filters.duration,
          sort: filters.sort,
          per_page: 48,
        };
        const res = await searchListings(apiParams);
        setItems(res.items || []);
      } catch {
        setItems([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  // Synchronise les marqueurs de la carte avec les résultats.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.L || !items) return;

    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    const bounds = [];
    items.forEach((l) => {
      if (l.lat == null || l.lng == null) return;
      const icon = window.L.divIcon({
        className: '',
        html: `<div style="background:#0f766e;color:#fff;font-weight:800;font-size:12px;padding:6px 10px;border-radius:100px;box-shadow:0 3px 10px rgba(0,0,0,.35);white-space:nowrap">${Math.round(
          l.price / 1000,
        )}k</div>`,
        iconSize: [0, 0],
      });
      const marker = window.L.marker([l.lat, l.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<b>${l.title}</b><br>${l.neighborhood?.name || 'Dakar'} — ${fcfa(
            l.price,
          )} FCFA<br>★ ${Number(l.rating).toFixed(1)} · <a href="/logement/${l.id}">voir</a>`,
        );
      markersRef.current[l.id] = marker;
      bounds.push([l.lat, l.lng]);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [items]);

  // Reflète les filtres non vides dans l'URL (liens partageables).
  useEffect(() => {
    const p = {};
    if (filters.q) p.q = filters.q;
    if (filters.type) p.type = filters.type;
    if (filters.budget !== '0') p.budget = filters.budget;
    if (filters.duration) p.duration = filters.duration;
    if (filters.sort !== 'recommended') p.sort = filters.sort;
    setParams(p, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const reset = () => {
    setFilters({ q: '', type: '', budget: '0', duration: '', sort: 'recommended' });
    toast(<RotateCcw size={18} />, 'Filtres réinitialisés');
  };

  return (
    <div className="p-search">
      <div className="searchtop">
        <div className="container filters">
          <input
            className="input grow"
            placeholder="Quartier, ville, type…"
            value={filters.q}
            onChange={set('q')}
          />
          <select className="input" value={filters.type} onChange={set('type')}>
            <option value="">Tous types</option>
            <option>Studio</option>
            <option>Chambre</option>
            <option>Appartement</option>
            <option>Villa</option>
          </select>
          <select className="input" value={filters.budget} onChange={set('budget')}>
            <option value="0">Budget max</option>
            <option value="150000">≤ 150 000</option>
            <option value="300000">≤ 300 000</option>
            <option value="600000">≤ 600 000</option>
            <option value="1000000">≤ 1 000 000</option>
            <option value="1500000">≤ 1 500 000</option>
            <option value="3000000">≤ 3 000 000</option>
          </select>
          <select className="input" value={filters.duration} onChange={set('duration')}>
            <option value="">Durée</option>
            <option value="longue">Longue durée</option>
            <option value="courte">Courte durée</option>
          </select>
          <select className="input" value={filters.sort} onChange={set('sort')}>
            <option value="recommended">Trier : recommandés</option>
            <option value="rating">Mieux notés</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
          <button className="btn btn-outline" onClick={reset}>
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="container layout">
        <div>
          <div className="result-head">
            <h1>
              <span className="count-badge">{items?.length ?? '…'}</span> logements à Dakar
            </h1>
            <span className="live">
              <span className="dot"></span>Mise à jour en direct
            </span>
          </div>
          {items === null ? (
            <Spinner />
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="big">
                <Search size={40} />
              </div>
              <b>Aucun logement trouvé</b>
              <p>Essayez d'élargir votre recherche ou de retirer un filtre.</p>
            </div>
          ) : (
            <div className="grid cols-2">
              {items.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          )}
        </div>
        <div id="map"></div>
      </div>
    </div>
  );
}
