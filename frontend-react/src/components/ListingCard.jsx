import { Link } from 'react-router-dom';
import { useState } from 'react';
import { BadgeCheck, Heart, MapPin, BedDouble, Bath, Ruler, Star } from 'lucide-react';
import { fcfa, favorites } from '../lib/utils';
import { useToast } from '../context/ToastContext';

/**
 * Carte d'annonce (réutilisée sur l'accueil, la recherche, le tableau de bord).
 *
 * NB : le statut Premium n'est PAS affiché — conformément au choix produit,
 * le boost reste invisible pour le visiteur (il n'influence que le classement).
 */
export default function ListingCard({ listing, index = 0 }) {
  const toast = useToast();
  const [faved, setFaved] = useState(() => favorites.has(listing.id));

  const quartier = listing.neighborhood?.name || 'Dakar';
  const cover =
    listing.images?.[0] ||
    'https://placehold.co/700x480/0f766e/ffffff?text=TerangaLoc';

  const toggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const on = favorites.toggle(listing.id);
    setFaved(on);
    toast(
      <Heart size={18} fill={on ? '#ef4444' : 'none'} />,
      on ? 'Ajouté aux favoris' : 'Retiré des favoris',
      listing.title,
    );
  };

  return (
    <Link className="card reveal in" to={`/logement/${listing.id}`} style={{ '--d': `${index * 60}ms` }}>
      <div className="card-media">
        <img
          src={cover}
          alt={listing.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/700x480/0f766e/ffffff?text=TerangaLoc';
          }}
        />
        <span className="badge">
          <BadgeCheck size={13} strokeWidth={2.5} /> Vérifié
        </span>
        <span className="badge type">{listing.type}</span>
        <button className="fav" onClick={toggleFav} aria-label="Favori">
          <Heart size={17} fill={faved ? '#ef4444' : 'none'} color={faved ? '#ef4444' : 'currentColor'} />
        </button>
      </div>
      <div className="card-body">
        <div className="price">
          {fcfa(listing.price)} FCFA <span>/ mois</span>
        </div>
        <h3>{listing.title}</h3>
        <div className="loc">
          <MapPin size={14} /> {quartier}, Dakar
        </div>
        <div className="meta">
          <span className="m">
            <BedDouble size={15} /> {listing.rooms}
          </span>
          <span className="m">
            <Bath size={15} /> {listing.bathrooms}
          </span>
          <span className="m">
            <Ruler size={15} /> {listing.area} m²
          </span>
          <span className="rating">
            <Star size={14} fill="currentColor" strokeWidth={0} className="star" />{' '}
            {Number(listing.rating).toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
