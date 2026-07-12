import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, Lock, Rocket, BarChart3 } from 'lucide-react';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/** Page Premium : grille tarifaire (mensuel/annuel), atouts, FAQ. */
export default function SubscriptionPage() {
  const [cycle, setCycle] = useState('mois'); // 'mois' | 'an'
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const price = (m, a) => (cycle === 'an' ? a : m);

  const choisir = (plan) => {
    if (plan === 'Gratuit') {
      navigate(isLoggedIn ? '/publier' : '/connexion?tab=inscription');
      return;
    }
    if (!isLoggedIn) {
      toast(<Lock size={18} />, 'Connexion requise', 'Connectez-vous pour souscrire à ' + plan);
      setTimeout(() => navigate('/connexion'), 900);
      return;
    }
    toast(<Star size={18} />, 'Offre ' + plan, 'Paiement bientôt disponible — merci de votre intérêt !', true);
  };

  return (
    <div className="p-sub">
      <div className="container">
        <div className="ab-hero">
          <span className="eyebrow">
            <Star size={15} /> Visibilité Premium pour propriétaires
          </span>
          <h1>Louez plus vite avec une annonce mise en avant</h1>
          <p>
            Les annonces Premium apparaissent <b>en tête des résultats</b>. Idéal pour les
            propriétaires qui veulent des contacts qualifiés, plus rapidement.
          </p>
          <div className="toggle">
            <button className={cycle === 'mois' ? 'on' : ''} onClick={() => setCycle('mois')}>
              Mensuel
            </button>
            <button className={cycle === 'an' ? 'on' : ''} onClick={() => setCycle('an')}>
              Annuel <small>(-20%)</small>
            </button>
          </div>
        </div>

        <div className="plans">
          <div className="plan">
            <h3>Gratuit</h3>
            <div className="pr">
              0 <small>FCFA</small>
            </div>
            <div className="tag">Pour publier et tester la plateforme.</div>
            <ul>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Jusqu'à 2 annonces actives
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Annonces vérifiées
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Messagerie avec les locataires
              </li>
              <li className="off">
                <span>
                  <X size={14} strokeWidth={3} />
                </span> Mise en avant dans les résultats
              </li>
              <li className="off">
                <span>
                  <X size={14} strokeWidth={3} />
                </span> Badge Premium doré
              </li>
              <li className="off">
                <span>
                  <X size={14} strokeWidth={3} />
                </span> Statistiques de vues
              </li>
            </ul>
            <button className="btn btn-outline btn-block" onClick={() => choisir('Gratuit')}>
              Commencer gratuitement
            </button>
          </div>

          <div className="plan featured">
            <h3>Premium</h3>
            <div className="pr">
              {price('5 000', '48 000')} <small>FCFA / {cycle}</small>
            </div>
            <div className="tag">Pour les propriétaires qui veulent louer vite.</div>
            <ul>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Jusqu'à 10 annonces actives
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> <b>Mise en avant</b> en tête des résultats
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span>{' '}
                Badge Premium doré
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Statistiques de vues &amp; demandes
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Support prioritaire
              </li>
              <li className="off">
                <span>
                  <X size={14} strokeWidth={3} />
                </span> Compte agence multi-utilisateurs
              </li>
            </ul>
            <button className="btn btn-accent btn-block" onClick={() => choisir('Premium')}>
              Passer en Premium
            </button>
          </div>

          <div className="plan">
            <h3>Pro / Agence</h3>
            <div className="pr">
              {price('20 000', '192 000')} <small>FCFA / {cycle}</small>
            </div>
            <div className="tag">Pour les agences et gros bailleurs.</div>
            <ul>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Annonces <b>illimitées</b>
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Toutes les fonctions Premium
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Compte agence multi-utilisateurs
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Badge « Agence vérifiée »
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Statistiques avancées &amp; export
              </li>
              <li>
                <span className="ck">
                  <Check size={14} strokeWidth={3} />
                </span> Accompagnement dédié
              </li>
            </ul>
            <button className="btn btn-primary btn-block" onClick={() => choisir('Pro')}>
              Choisir Pro
            </button>
          </div>
        </div>

        <section className="section">
          <Reveal className="section-head" style={{ justifyContent: 'center', textAlign: 'center', display: 'block' }}>
            <span className="eyebrow">Pourquoi ça marche</span>
            <h2>Plus de visibilité = plus de contacts</h2>
          </Reveal>
          <div className="why">
            <Reveal className="c">
              <div className="ic">
                <Rocket size={26} />
              </div>
              <h4>En tête des résultats</h4>
              <p>Votre annonce passe devant les annonces standards sur la recherche et l'accueil.</p>
            </Reveal>
            <Reveal className="c">
              <div className="ic">
                <Star size={26} />
              </div>
              <h4>Badge de confiance</h4>
              <p>Le badge doré attire l'œil et rassure les locataires sérieux.</p>
            </Reveal>
            <Reveal className="c">
              <div className="ic">
                <BarChart3 size={26} />
              </div>
              <h4>Vous pilotez</h4>
              <p>Suivez les vues et les demandes depuis votre tableau de bord pour ajuster votre prix.</p>
            </Reveal>
          </div>
        </section>

        <section className="section faq">
          <Reveal className="section-head" style={{ justifyContent: 'center', textAlign: 'center', display: 'block' }}>
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Bon à savoir</h2>
          </Reveal>
          <details>
            <summary>Comment fonctionne la mise en avant ?</summary>
            <p>
              Les annonces Premium sont triées avant les annonces gratuites dans la recherche et la
              sélection de l'accueil.
            </p>
          </details>
          <details>
            <summary>Puis-je annuler à tout moment ?</summary>
            <p>Oui. L'abonnement est sans engagement : revenez à l'offre gratuite quand vous voulez.</p>
          </details>
          <details>
            <summary>Comment se passe le paiement ?</summary>
            <p>Le paiement (Wave, Orange Money, carte) sera intégré prochainement.</p>
          </details>
        </section>
      </div>
    </div>
  );
}
