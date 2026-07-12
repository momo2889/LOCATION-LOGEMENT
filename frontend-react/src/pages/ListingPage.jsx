import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Snowflake, Car, Trees, Utensils, ShieldCheck, Wifi,
  MapPin, BedDouble, Ruler, BadgeCheck, Rotate3d, Move,
  Lock, MessageCircle, Phone, AlertTriangle, AtSign,
} from 'lucide-react';
import { getListing, startConversation } from '../lib/api';
import { fcfa } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const AMENITIES = [
  [Snowflake, 'Climatisation'],
  [Car, 'Parking privé'],
  [Trees, 'Jardin / terrasse'],
  [Utensils, 'Cuisine équipée'],
  [ShieldCheck, 'Gardien / sécurité'],
  [Wifi, 'Fibre internet'],
];

/** Détail d'un logement : visite 360°, galerie, spécifications, contact propriétaire. */
export default function ListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const [contacting, setContacting] = useState(false);
  const panoRef = useRef(null);

  useEffect(() => {
    setListing(null);
    getListing(id)
      .then(setListing)
      .catch((e) => setError(e.message || 'Annonce introuvable.'));
  }, [id]);

  // Visite 360° (Pannellum) — initialisée quand l'annonce et le panorama sont prêts.
  useEffect(() => {
    if (!listing?.pano || !window.pannellum || !panoRef.current) return;
    // On charge le panorama en URL relative (même origine que le front) : Pannellum
    // l'injecte dans une texture WebGL avec crossOrigin="anonymous", ce qui échoue si
    // l'image est cross-origin sans en-tête CORS. Le proxy Vite /storage la sert donc
    // sous l'origine du front. (Les panoramas de démo en /pano/ sont déjà relatifs.)
    const panoUrl = listing.pano.replace(/^https?:\/\/[^/]+/, '');
    const viewer = window.pannellum.viewer(panoRef.current, {
      type: 'equirectangular',
      panorama: panoUrl,
      autoLoad: true,
      autoRotate: -2,
      showZoomCtrl: true,
      compass: false,
      hfov: 110,
    });
    return () => viewer?.destroy?.();
  }, [listing]);

  if (error) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Annonce introuvable</h1>
        <p className="mut" style={{ marginBottom: 20 }}>{error}</p>
        <Link to="/recherche" className="btn btn-primary">
          Retour à la recherche
        </Link>
      </div>
    );
  }
  if (!listing) return <Spinner full />;

  const quartier = listing.neighborhood?.name || 'Dakar';
  const ownerName = listing.owner?.name || 'Propriétaire';
  const ownerInitials = ownerName
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const gallery = listing.images?.length ? listing.images : [];
  // Panorama de démo (générique, servi depuis /pano/) vs vrai 360° téléversé par
  // le propriétaire (servi depuis /storage/). On le signale honnêtement.
  const isDemoPano = listing.pano?.includes('/pano/');

  // Coordonnées de contact direct du propriétaire (à la Leboncoin).
  const owner = listing.owner || {};
  const digits = (n) => (n || '').replace(/[^0-9]/g, ''); // wa.me veut des chiffres seulement
  const waMessage = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par votre annonce « ${listing.title} » sur TerangaLoc.`,
  );
  const whatsappLink = owner.whatsapp ? `https://wa.me/${digits(owner.whatsapp)}?text=${waMessage}` : null;
  const phoneLink = owner.phone ? `tel:${owner.phone.replace(/\s/g, '')}` : null;
  const instagramLink = owner.instagram
    ? `https://instagram.com/${owner.instagram.replace(/^@/, '')}`
    : null;

  const contactOwner = async () => {
    if (!isLoggedIn) {
      toast(<Lock size={18} />, 'Connexion requise', 'Connectez-vous pour contacter le propriétaire');
      navigate('/connexion', { state: { from: { pathname: `/logement/${id}` } } });
      return;
    }
    setContacting(true);
    try {
      const conv = await startConversation(
        listing.id,
        `Bonjour, le logement « ${listing.title} » est-il toujours disponible ? J'aimerais organiser une visite.`,
      );
      toast(<MessageCircle size={18} />, 'Conversation ouverte', `Vous pouvez échanger avec ${ownerName}`);
      navigate(`/messagerie?c=${conv.id}`);
    } catch (e) {
      toast(<AlertTriangle size={18} />, 'Impossible de contacter', e.message || 'Réessayez plus tard');
      setContacting(false);
    }
  };

  return (
    <div className="p-listing">
      <div className="container">
        <div className="crumb">
          <Link to="/">Accueil</Link> › <Link to="/recherche">Recherche</Link> ›{' '}
          <span>{listing.title}</span>
        </div>

        <div className="head-row">
          <div>
            <h1>{listing.title}</h1>
            <div className="loc" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <MapPin size={15} /> {quartier}, Dakar · <BedDouble size={15} /> {listing.rooms} chambres ·{' '}
              <Ruler size={15} /> {listing.area} m²
            </div>
            <span className="verified" style={{ marginTop: 8 }}>
              <BadgeCheck size={14} /> Propriétaire vérifié
            </span>
          </div>
          <div className="price-tag">
            <b>{fcfa(listing.price)} FCFA</b>
            <br />
            <span>/ mois</span>
          </div>
        </div>

        {listing.pano && (
          <div className="tour">
            <div className="tour-tag">
              <Rotate3d size={16} /> Visite immersive 360°{isDemoPano ? ' · illustration' : ''}
            </div>
            <div id="panorama" ref={panoRef}></div>
            <div className="tour-hint">
              <Move size={14} />{' '}
              {isDemoPano
                ? 'Panorama de démonstration — sur une vraie annonce, le propriétaire téléverse la 360° du logement'
                : 'Faites glisser pour explorer · plein écran = effet casque VR'}
            </div>
          </div>
        )}

        <div className="gallery">
          {gallery.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${listing.title} ${i + 1}`}
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/500x375/0f766e/fff?text=Photo';
              }}
            />
          ))}
        </div>

        <div className="layout">
          <div>
            <div className="specs">
              {[
                [listing.rooms, 'Chambres'],
                [listing.bathrooms, 'Salles de bain'],
                [listing.area, 'm² habitables'],
                [listing.furnished ? 'Oui' : 'Non', 'Meublé'],
              ].map((s, i) => (
                <div className="spec" key={i}>
                  <div className="n">{s[0]}</div>
                  <div className="l">{s[1]}</div>
                </div>
              ))}
            </div>

            <h2 className="sec">Description</h2>
            <p className="desc">{listing.description}</p>

            <h2 className="sec">Équipements</h2>
            <div className="amen">
              {AMENITIES.map(([Ic, label]) => (
                <div key={label}>
                  <span className="dot">
                    <Ic size={16} />
                  </span>{' '}
                  {label}
                </div>
              ))}
            </div>
          </div>

          <aside className="side">
            <div className="owner-card">
              <div className="owner">
                <div className="avatar">{ownerInitials}</div>
                <div>
                  <div className="nm">{ownerName}</div>
                  <div className="sub" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Propriétaire
                    {owner.is_verified && (
                      <>
                        {' · '}
                        <BadgeCheck size={13} /> vérifié
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact direct — comme sur Leboncoin */}
              <div className="contact-actions">
                {whatsappLink && (
                  <a className="btn btn-wa" href={whatsappLink} target="_blank" rel="noreferrer">
                    <MessageCircle size={17} /> WhatsApp
                  </a>
                )}
                {phoneLink && (
                  <a className="btn btn-outline" href={phoneLink}>
                    <Phone size={17} /> Appeler {owner.phone}
                  </a>
                )}
                {instagramLink && (
                  <a className="btn btn-ig" href={instagramLink} target="_blank" rel="noreferrer">
                    <AtSign size={17} /> Instagram
                  </a>
                )}
              </div>

              <div className="divider" style={{ margin: '14px 0' }}></div>

              <button className="btn btn-accent" onClick={contactOwner} disabled={contacting}>
                {contacting ? (
                  'Ouverture…'
                ) : (
                  <>
                    <MessageCircle size={17} /> Message via TerangaLoc
                  </>
                )}
              </button>
              {!whatsappLink && !phoneLink && (
                <p className="mut" style={{ fontSize: 13, marginTop: 8 }}>
                  Ce propriétaire n'a pas renseigné de contact direct — utilisez la messagerie.
                </p>
              )}
            </div>
            <div className="safe">
              <h4>
                <ShieldCheck size={16} /> Louez en sécurité
              </h4>
              Ne payez jamais avant d'avoir visité et signé. Échangez uniquement via la messagerie
              TerangaLoc. Signalez toute annonce suspecte.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
