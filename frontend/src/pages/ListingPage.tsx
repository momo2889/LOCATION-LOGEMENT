import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listings, formatFcfa } from '../data/listings';
import './listings.css';

const amenities = [
  { icon: '❄️', label: 'Climatisation' },
  { icon: '🚗', label: 'Parking' },
  { icon: '🌳', label: 'Jardin / terrasse' },
  { icon: '🍳', label: 'Cuisine équipée' },
  { icon: '🛡️', label: 'Gardien' },
  { icon: '📶', label: 'Fibre internet' },
];

export default function ListingPage() {
  const { id } = useParams();
  const listing = listings.find((l) => l.id === Number(id));
  const [active, setActive] = useState(0);

  if (!listing) {
    return (
      <div className="container" style={{ padding: '48px 20px' }}>
        <h1>Logement introuvable</h1>
        <p className="muted">Cette annonce n'existe pas ou a été retirée.</p>
        <Link to="/logements" className="btn btn-primary">Retour aux logements</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px 20px 60px' }}>
      <p className="muted" style={{ fontSize: '.88rem' }}>
        <Link to="/logements">Logements</Link> · {listing.area}, Dakar
      </p>

      <div className="listing-header">
        <div>
          <h1>{listing.title}</h1>
          <p className="muted" style={{ margin: '4px 0 8px' }}>
            📍 {listing.area}, Dakar · {listing.rooms} chambres · {listing.m2} m²
          </p>
          <span className="badge badge-verified">✅ Propriétaire vérifié</span>
        </div>
        <div className="listing-price-lg">
          {formatFcfa(listing.price)}<span> / mois</span>
        </div>
      </div>

      <div className="gallery">
        <img className="gallery-main" src={listing.images[active]} alt={listing.title} />
        {listing.images.length > 1 && (
          <div className="gallery-thumbs">
            {listing.images.map((src, i) => (
              <button
                key={src}
                className={`thumb ${i === active ? 'active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Photo ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="listing-detail">
        <div>
          <div className="spec-row">
            <div className="spec"><strong>{listing.rooms}</strong><span>Chambres</span></div>
            <div className="spec"><strong>{listing.baths}</strong><span>Salles de bain</span></div>
            <div className="spec"><strong>{listing.m2}</strong><span>m²</span></div>
            <div className="spec"><strong>{listing.furnished ? 'Oui' : 'Non'}</strong><span>Meublé</span></div>
          </div>

          <h2 style={{ marginTop: 28 }}>Description</h2>
          <p>{listing.description}</p>

          <h2 style={{ marginTop: 24 }}>Équipements</h2>
          <div className="amenities">
            {amenities.map((a) => (
              <div key={a.label} className="amenity">
                <span className="amenity-icon">{a.icon}</span> {a.label}
              </div>
            ))}
          </div>
        </div>

        <aside className="listing-aside">
          <div className="card owner-card">
            <div className="owner">
              <span className="owner-avatar">AS</span>
              <div>
                <strong>Aliou Sarr</strong>
                <div className="muted" style={{ fontSize: '.82rem' }}>Propriétaire vérifié</div>
              </div>
            </div>
            <Link to="/login" className="btn btn-accent btn-block">Contacter le propriétaire</Link>
            <Link to="/login" className="btn btn-ghost btn-block" style={{ marginTop: 10 }}>Demander une visite</Link>
          </div>
          <div className="card safety-card">
            <strong>🛡️ Louez en sécurité</strong>
            <p className="muted" style={{ margin: '8px 0 0', fontSize: '.86rem' }}>
              Ne payez jamais avant d'avoir visité et signé. Échangez uniquement via la plateforme et signalez toute annonce suspecte.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
