import { Link } from 'react-router-dom';
import { Home, Heart } from 'lucide-react';

/** Pied de page global. */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link className="logo" to="/">
              <span className="mark">
                <Home size={19} strokeWidth={2.5} />
              </span>{' '}
              Teranga<b style={{ color: '#5eead4' }}>Loc</b>
            </Link>
            <p>
              La plateforme de confiance pour louer un logement au Sénégal. Annonces vérifiées,
              sans intermédiaire.
            </p>
            <div className="socials">
              <a href="#">f</a>
              <a href="#">in</a>
              <a href="#">X</a>
              <a href="#">◎</a>
            </div>
          </div>
          <div className="foot-col">
            <h5>Explorer</h5>
            <Link to="/recherche">Logements à Dakar</Link>
            <Link to="/recherche?type=Chambre">Colocations</Link>
            <Link to="/recherche?duration=courte">Courte durée</Link>
            <Link to="/recherche?type=Villa">Villas</Link>
          </div>
          <div className="foot-col">
            <h5>Propriétaires</h5>
            <Link to="/publier">Publier une annonce</Link>
            <Link to="/tableau-de-bord">Tableau de bord</Link>
            <Link to="/abonnement">Devenir Premium</Link>
          </div>
          <div className="foot-col">
            <h5>Aide</h5>
            <Link to="/contact">Contact</Link>
            <a href="#">Sécurité &amp; anti-arnaque</a>
            <a href="#">Centre d'aide</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 TerangaLoc. Tous droits réservés.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            Fait avec <Heart size={13} fill="#ef4444" strokeWidth={0} /> à Dakar, Sénégal
          </span>
        </div>
      </div>
    </footer>
  );
}
