import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BadgeCheck, Search, Flame, ShieldCheck, Rotate3d, Map, ArrowRight, Plus } from 'lucide-react';
import { searchListings } from '../lib/api';
import ListingCard from '../components/ListingCard';
import Reveal from '../components/Reveal';
import Spinner from '../components/Spinner';

/** Page d'accueil : hero, barre de recherche, sélection vedette, atouts, CTA. */
export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState(null);
  const [form, setForm] = useState({ q: '', type: '', budget: '0' });

  // Sélection vedette : le tri « recommended » remonte les annonces Premium.
  useEffect(() => {
    searchListings({ per_page: 4 })
      .then((res) => setFeatured(res.items || []))
      .catch(() => setFeatured([]));
  }, []);

  const goSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (form.q.trim()) p.set('q', form.q.trim());
    if (form.type) p.set('type', form.type);
    if (form.budget && form.budget !== '0') p.set('budget', form.budget);
    navigate('/recherche' + (p.toString() ? '?' + p.toString() : ''));
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="p-home">
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">
            <BadgeCheck size={15} /> Propriétaires et logements vérifiés ·{' '}
            <span className="live" style={{ color: '#a7f3d0' }}>
              <span className="dot" style={{ background: '#a7f3d0' }}></span>1 240 en ligne
            </span>
          </span>
          <h1>Trouvez votre prochain logement au Sénégal, en toute confiance.</h1>
          <p>
            Studios, chambres, appartements et villas à Dakar et partout au Sénégal. Fini les
            démarcheurs et les arnaques — annonces vérifiées, recherche sur carte, visite immersive
            360° et contact direct.
          </p>
        </div>
      </section>

      <div className="container searchbar">
        <form className="search-card" onSubmit={goSearch}>
          <div className="f">
            <label>Localisation</label>
            <input
              type="text"
              placeholder="Quartier (Plateau, Almadies…)"
              value={form.q}
              onChange={set('q')}
            />
          </div>
          <div className="f">
            <label>Type</label>
            <select value={form.type} onChange={set('type')}>
              <option value="">Tous les types</option>
              <option>Studio</option>
              <option>Chambre</option>
              <option>Appartement</option>
              <option>Villa</option>
            </select>
          </div>
          <div className="f">
            <label>Budget max</label>
            <select value={form.budget} onChange={set('budget')}>
              <option value="0">Indifférent</option>
              <option value="150000">≤ 150 000</option>
              <option value="300000">≤ 300 000</option>
              <option value="600000">≤ 600 000</option>
              <option value="1000000">≤ 1 000 000</option>
              <option value="3000000">≤ 3 000 000</option>
            </select>
          </div>
          <div className="f" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary btn-block" style={{ height: 48 }}>
              <Search size={17} /> Rechercher
            </button>
          </div>
        </form>
      </div>

      <div className="container">
        <Reveal className="trust">
          <div className="item">
            <b>1 240+</b>
            <small>logements disponibles</small>
          </div>
          <div className="item">
            <b>98%</b>
            <small>propriétaires vérifiés</small>
          </div>
          <div className="item">
            <b>15</b>
            <small>quartiers couverts</small>
          </div>
          <div className="item">
            <b>4.8/5</b>
            <small>satisfaction locataires</small>
          </div>
        </Reveal>
      </div>

      <section className="section container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">
              <Flame size={15} /> Sélection du moment
            </span>
            <h2>Logements vedettes à Dakar</h2>
            <p>Vérifiés et mis à jour aujourd'hui</p>
          </div>
          <Link className="link-more" to="/recherche">
            Voir tous les logements <ArrowRight size={15} />
          </Link>
        </Reveal>
        {featured === null ? (
          <Spinner />
        ) : (
          <div className="grid cols-4">
            {featured.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        )}
      </section>

      <section
        className="section"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--line)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div className="container">
          <Reveal className="section-head" style={{ justifyContent: 'center', textAlign: 'center', display: 'block' }}>
            <span className="eyebrow">Pourquoi TerangaLoc</span>
            <h2>Une expérience pensée pour la confiance</h2>
          </Reveal>
          <div className="feat">
            <Reveal className="fcard" delay={0}>
              <div className="ic">
                <ShieldCheck size={26} />
              </div>
              <h3>Zéro arnaque</h3>
              <p>Chaque propriétaire et chaque annonce sont vérifiés avant publication. Signalement en un clic.</p>
            </Reveal>
            <Reveal className="fcard" delay={100}>
              <div className="ic">
                <Rotate3d size={26} />
              </div>
              <h3>Visite immersive 360°</h3>
              <p>Explorez le logement comme avec un casque VR, sans vous déplacer. Gagnez du temps.</p>
            </Reveal>
            <Reveal className="fcard" delay={200}>
              <div className="ic">
                <Map size={26} />
              </div>
              <h3>Recherche sur carte</h3>
              <p>Trouvez par quartier et proximité grâce à la géolocalisation en temps réel.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section container">
        <Reveal className="section-head" style={{ justifyContent: 'center', textAlign: 'center', display: 'block' }}>
          <span className="eyebrow">Simple & sécurisé</span>
          <h2>Comment ça marche</h2>
        </Reveal>
        <div className="steps">
          <Reveal className="step" delay={0}>
            <div className="n">1</div>
            <h4>Recherchez</h4>
            <p>Filtrez par quartier, prix et type, ou explorez la carte.</p>
          </Reveal>
          <Reveal className="step" delay={120}>
            <div className="n">2</div>
            <h4>Contactez</h4>
            <p>Échangez avec le propriétaire vérifié via la messagerie sécurisée.</p>
          </Reveal>
          <Reveal className="step" delay={240}>
            <div className="n">3</div>
            <h4>Emménagez</h4>
            <p>Déposez votre dossier, obtenez l'accord, récupérez les clés.</p>
          </Reveal>
        </div>
      </section>

      <section className="section container">
        <Reveal className="cta">
          <h2>Vous êtes propriétaire ?</h2>
          <p>Publiez votre logement gratuitement et touchez des milliers de locataires vérifiés.</p>
          <Link to="/publier" className="btn btn-accent btn-lg">
            <Plus size={18} /> Publier une annonce
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
