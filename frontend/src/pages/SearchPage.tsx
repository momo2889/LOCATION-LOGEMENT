import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { listings, formatFcfa, type ListingType } from '../data/listings';
import './listings.css';

const types: (ListingType | 'Tous')[] = ['Tous', 'Studio', 'Chambre', 'Appartement', 'Villa'];
const budgets = [
  { label: 'Budget max', value: 0 },
  { label: '≤ 150 000', value: 150000 },
  { label: '≤ 300 000', value: 300000 },
  { label: '≤ 600 000', value: 600000 },
  { label: '≤ 1 200 000', value: 1200000 },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<ListingType | 'Tous'>('Tous');
  const [budget, setBudget] = useState(0);
  const [sort, setSort] = useState('note');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = listings.filter(
      (l) =>
        (!q || l.title.toLowerCase().includes(q) || l.area.toLowerCase().includes(q)) &&
        (type === 'Tous' || l.type === type) &&
        (!budget || l.price <= budget),
    );
    if (sort === 'prix-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'prix-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'surface') list = [...list].sort((a, b) => b.m2 - a.m2);
    else list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [query, type, budget, sort]);

  return (
    <div className="container" style={{ padding: '28px 20px 60px' }}>
      <h1>Logements à Dakar</h1>
      <p className="muted">Parcourez les annonces vérifiées et filtrez selon vos critères.</p>

      <div className="search-filters">
        <input
          className="input"
          placeholder="Quartier ou mot-clé…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input" value={type} onChange={(e) => setType(e.target.value as ListingType | 'Tous')}>
          {types.map((tp) => (
            <option key={tp} value={tp}>{tp === 'Tous' ? 'Tous les types' : tp}</option>
          ))}
        </select>
        <select className="input" value={budget} onChange={(e) => setBudget(Number(e.target.value))}>
          {budgets.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="note">Mieux notés</option>
          <option value="prix-asc">Prix croissant</option>
          <option value="prix-desc">Prix décroissant</option>
          <option value="surface">Surface</option>
        </select>
      </div>

      <p className="muted" style={{ margin: '18px 0 12px' }}>
        <strong style={{ color: 'var(--color-primary)' }}>{results.length}</strong> logement{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
      </p>

      {results.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '2.6rem' }}>🔍</span>
          <p>Aucun logement ne correspond. Élargissez votre recherche.</p>
        </div>
      ) : (
        <div className="listing-grid">
          {results.map((l, i) => (
            <Link
              key={l.id}
              to={`/logements/${l.id}`}
              className="listing-card"
              style={{ animationDelay: `${i * 40}ms` } as CSSProperties}
            >
              <div className="listing-media">
                <img src={l.images[0]} alt={l.title} loading="lazy" />
                <span className="listing-badge">✅ Vérifié</span>
                <span className="listing-badge type">{l.type}</span>
              </div>
              <div className="listing-body">
                <div className="listing-price">
                  {formatFcfa(l.price)} <span>/ mois</span>
                </div>
                <h3>{l.title}</h3>
                <div className="listing-loc">📍 {l.area}, Dakar</div>
                <div className="listing-meta">
                  <span>🛏️ {l.rooms}</span>
                  <span>🛁 {l.baths}</span>
                  <span>📐 {l.m2} m²</span>
                  <span className="rate"><span className="star">★</span> {l.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
