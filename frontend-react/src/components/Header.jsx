import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Star, Sun, Moon, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

/** En-tête global : navigation, thème, palette de commandes, actions de session. */
export default function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const initials =
    (user?.name || '')
      .split(' ')
      .filter(Boolean)
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  const firstName = (user?.name || 'Mon compte').split(' ')[0];

  const onLogout = async () => {
    await logout();
    toast(<LogOut size={18} />, 'Déconnexion', 'À bientôt sur TerangaLoc');
    navigate('/');
  };

  const linkClass = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="logo" to="/">
          <span className="mark">
            <Home size={19} strokeWidth={2.5} />
          </span>{' '}
          Teranga<b>Loc</b>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={linkClass}>
            Accueil
          </NavLink>
          <NavLink to="/recherche" className={linkClass}>
            Rechercher
          </NavLink>
          <NavLink to="/publier" className={linkClass}>
            Publier
          </NavLink>
          <NavLink to="/tableau-de-bord" className={linkClass}>
            Tableau de bord
          </NavLink>
          <NavLink to="/messagerie" className={linkClass}>
            Messages
          </NavLink>
          <NavLink to="/abonnement" className={linkClass}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              Premium <Star size={14} fill="currentColor" strokeWidth={0} />
            </span>
          </NavLink>
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" onClick={toggle} title="Changer de thème">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isLoggedIn ? (
            <>
              <Link className="btn btn-ghost" to="/profil" title={user?.name}>
                <span
                  style={{
                    display: 'inline-grid',
                    placeItems: 'center',
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--primary),#22d3ee)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    marginRight: 7,
                  }}
                >
                  {initials || <User size={14} />}
                </span>
                {firstName}
              </Link>
              <button className="btn btn-primary" onClick={onLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/connexion">
                Connexion
              </Link>
              <Link className="btn btn-primary" to="/connexion?tab=inscription">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
