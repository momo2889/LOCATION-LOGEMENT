import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Star, MessageCircle, Wallet, Trash2, Plus, ArrowRight, BadgeCheck, AlertTriangle } from 'lucide-react';
import { myListings, deleteListing, getConversations } from '../lib/api';
import { fcfa } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

/**
 * Tableau de bord propriétaire — chiffres RÉELS uniquement (annonces publiées,
 * note moyenne, conversations) et gestion directe de ses annonces.
 */
export default function DashboardPage() {
  const { user, isVerified, isOwner } = useAuth();
  const toast = useToast();
  const [mine, setMine] = useState(null);
  const [convCount, setConvCount] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const firstName = (user?.name || '').split(' ')[0] || '';

  useEffect(() => {
    myListings()
      .then((list) => setMine(list || []))
      .catch(() => setMine([]));
    getConversations()
      .then((list) => setConvCount((list || []).length))
      .catch(() => setConvCount(0));
  }, []);

  const remove = async (listing) => {
    if (!window.confirm(`Supprimer définitivement l'annonce « ${listing.title} » ?`)) return;
    setDeleting(listing.id);
    try {
      await deleteListing(listing.id);
      setMine((list) => list.filter((l) => l.id !== listing.id));
      toast(<Trash2 size={18} />, 'Annonce supprimée', listing.title);
    } catch (e) {
      toast(<AlertTriangle size={18} />, 'Suppression impossible', e.message || 'Réessayez');
    } finally {
      setDeleting(null);
    }
  };

  if (mine === null) return <Spinner full />;

  // Statistiques réelles calculées à partir des annonces du propriétaire.
  const count = mine.length;
  const avgRating = count
    ? (mine.reduce((s, l) => s + Number(l.rating || 0), 0) / count).toFixed(1)
    : '—';
  const totalValue = mine.reduce((s, l) => s + Number(l.price || 0), 0);

  return (
    <div className="container p-dash">
      <h1>Bonjour, {firstName}</h1>
      <div className="sub">
        Votre espace propriétaire
        {isVerified && (
          <>
            {' '}
            ·{' '}
            <span className="pill pub" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <BadgeCheck size={13} /> Vérifié
            </span>
          </>
        )}
      </div>

      {!isOwner && (
        <div className="note" style={{ marginBottom: 20 }}>
          Activez votre espace propriétaire depuis votre{' '}
          <Link to="/profil" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            profil
          </Link>{' '}
          pour publier des annonces.
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <div className="ic">
            <Home size={22} />
          </div>
          <div className="n">{count}</div>
          <div className="l">Annonces publiées</div>
        </div>
        <div className="stat">
          <div className="ic" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Star size={22} />
          </div>
          <div className="n">{avgRating}</div>
          <div className="l">Note moyenne</div>
        </div>
        <div className="stat">
          <div className="ic" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <MessageCircle size={22} />
          </div>
          <div className="n">{convCount}</div>
          <div className="l">Conversations</div>
        </div>
        <div className="stat">
          <div className="ic" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <Wallet size={22} />
          </div>
          <div className="n" style={{ fontSize: 20 }}>{fcfa(totalValue)}</div>
          <div className="l">Loyers cumulés / mois</div>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Mes annonces</h3>
          <Link to="/publier" className="btn btn-primary">
            <Plus size={16} /> Publier
          </Link>
        </div>
        <div className="mylist">
          {count === 0 ? (
            <div className="empty-mine">
              Vous n'avez pas encore d'annonce.{' '}
              <Link to="/publier" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Publier maintenant <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            mine.map((l) => (
              <div className="li" key={l.id}>
                <img
                  src={l.images?.[0]}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/64x52/0f766e/fff';
                  }}
                />
                <div className="info">
                  <b>{l.title}</b>
                  <small style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {l.neighborhood?.name} · {fcfa(l.price)} FCFA ·{' '}
                    <Star size={12} fill="currentColor" strokeWidth={0} /> {Number(l.rating).toFixed(1)}
                  </small>
                </div>
                <span className={'pill ' + (l.status === 'published' ? 'pub' : 'att')}>
                  {l.status === 'published' ? 'Publiée' : 'Brouillon'}
                </span>
                <Link to={`/logement/${l.id}`} className="btn btn-outline btn-sm">
                  Voir
                </Link>
                <button
                  className="btn btn-outline btn-sm btn-danger"
                  onClick={() => remove(l)}
                  disabled={deleting === l.id}
                >
                  {deleting === l.id ? '…' : <Trash2 size={15} />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
