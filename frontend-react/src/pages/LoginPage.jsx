import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Home, BadgeCheck, Rotate3d, MessageCircle, Map, KeyRound, CheckCircle2, PartyPopper, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { forgotPassword } from '../lib/api';

/** Concatène les erreurs de validation Laravel ({champ:[msg]}) en texte lisible. */
function flatErrors(err) {
  if (err?.errors) return Object.values(err.errors).flat().join(' ');
  return err?.message || 'Une erreur est survenue.';
}

/** Connexion + inscription (deux onglets) + mot de passe oublié. */
export default function LoginPage() {
  const { login, register, isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [tab, setTab] = useState(params.get('tab') === 'inscription' ? 'signup' : 'login');
  const [role, setRole] = useState('tenant');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ name: '', email: '', phone: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [signupErr, setSignupErr] = useState('');
  const [busy, setBusy] = useState(false);

  // Destination après authentification (page demandée avant, sinon tableau de bord).
  const dest = location.state?.from?.pathname || '/tableau-de-bord';

  // Déjà connecté ? On file au tableau de bord.
  useEffect(() => {
    if (isLoggedIn) navigate('/tableau-de-bord', { replace: true });
  }, [isLoggedIn, navigate]);

  const doLogin = async () => {
    setLoginErr('');
    if (!loginForm.email || !loginForm.password) {
      setLoginErr('Renseignez votre email et votre mot de passe.');
      return;
    }
    setBusy(true);
    try {
      const user = await login(loginForm);
      toast(<CheckCircle2 size={18} />, 'Connexion réussie', `Bienvenue ${user?.name?.split(' ')[0] || ''} !`, true);
      navigate(dest, { replace: true });
    } catch (err) {
      setLoginErr(flatErrors(err));
      setBusy(false);
    }
  };

  const doSignup = async () => {
    setSignupErr('');
    if (!signup.name || !signup.email || !signup.password) {
      setSignupErr('Nom, email et mot de passe sont obligatoires.');
      return;
    }
    setBusy(true);
    try {
      const user = await register({
        name: signup.name,
        email: signup.email,
        phone: signup.phone || undefined,
        password: signup.password,
        role,
      });
      toast(<PartyPopper size={18} />, 'Compte créé', `Bienvenue sur TerangaLoc, ${user?.name?.split(' ')[0] || ''} !`, true);
      navigate(dest, { replace: true });
    } catch (err) {
      setSignupErr(flatErrors(err));
      setBusy(false);
    }
  };

  const doForgot = async (e) => {
    e.preventDefault();
    if (!loginForm.email) {
      setLoginErr('Saisissez votre email ci-dessus, puis cliquez sur « Réinitialiser ».');
      return;
    }
    try {
      await forgotPassword(loginForm.email);
      setLoginErr('');
      toast(<Mail size={18} />, 'Email envoyé', 'Si un compte existe, un lien de réinitialisation a été envoyé.', true);
    } catch (err) {
      setLoginErr(flatErrors(err));
    }
  };

  const onEnter = (fn) => (e) => {
    if (e.key === 'Enter') fn();
  };

  return (
    <div className="p-auth">
      <div className="aside">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            className="mark"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: 'rgba(255,255,255,.15)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Home size={20} />
          </span>{' '}
          TerangaLoc
        </div>
        <h2>Votre logement de confiance, à portée de clic.</h2>
        <p>
          Rejoignez des milliers de Sénégalais qui trouvent et proposent des logements en toute
          sécurité.
        </p>
        <ul>
          <li>
            <span className="c">
              <BadgeCheck size={16} />
            </span>{' '}
            Annonces et propriétaires vérifiés
          </li>
          <li>
            <span className="c">
              <Rotate3d size={16} />
            </span>{' '}
            Visites immersives 360°
          </li>
          <li>
            <span className="c">
              <MessageCircle size={16} />
            </span>{' '}
            Messagerie sécurisée en direct
          </li>
          <li>
            <span className="c">
              <Map size={16} />
            </span>{' '}
            Recherche par quartier sur carte
          </li>
        </ul>
      </div>

      <div className="formside">
        <div className="formcard">
          <div className="tabs">
            <button className={'tab' + (tab === 'login' ? ' active' : '')} onClick={() => setTab('login')}>
              Connexion
            </button>
            <button className={'tab' + (tab === 'signup' ? ' active' : '')} onClick={() => setTab('signup')}>
              Inscription
            </button>
          </div>

          {tab === 'login' ? (
            <div>
              <h1>Bon retour</h1>
              <p className="lead">Connectez-vous pour accéder à votre espace.</p>
              {loginErr && <div className="form-error">{loginErr}</div>}
              <div className="field">
                <label className="lab">Email</label>
                <input
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="field">
                <label className="lab">Mot de passe</label>
                <input
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  onKeyDown={onEnter(doLogin)}
                />
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={doLogin} disabled={busy}>
                {busy ? 'Connexion…' : 'Se connecter'}
              </button>
              <div className="muted-links">
                Mot de passe oublié ? <a onClick={doForgot}>Réinitialiser</a>
              </div>
            </div>
          ) : (
            <div>
              <h1>Créer un compte</h1>
              <p className="lead">Gratuit et sans engagement.</p>
              {signupErr && <div className="form-error">{signupErr}</div>}
              <div className="roles">
                <div className={'role' + (role === 'tenant' ? ' sel' : '')} onClick={() => setRole('tenant')}>
                  <div className="e">
                    <KeyRound size={24} />
                  </div>
                  <b>Je cherche</b>
                  <small className="mut">Locataire</small>
                </div>
                <div className={'role' + (role === 'owner' ? ' sel' : '')} onClick={() => setRole('owner')}>
                  <div className="e">
                    <Home size={24} />
                  </div>
                  <b>Je propose</b>
                  <small className="mut">Propriétaire</small>
                </div>
              </div>
              <div className="field">
                <label className="lab">Nom complet</label>
                <input
                  className="input"
                  placeholder="Modou Diop"
                  value={signup.name}
                  onChange={(e) => setSignup((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="field">
                <label className="lab">Email</label>
                <input
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  value={signup.email}
                  onChange={(e) => setSignup((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="field">
                <label className="lab">Téléphone</label>
                <input
                  className="input"
                  placeholder="+221 …"
                  value={signup.phone}
                  onChange={(e) => setSignup((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="field">
                <label className="lab">Mot de passe</label>
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="8 caractères min., majuscule, minuscule et chiffre"
                  value={signup.password}
                  onChange={(e) => setSignup((f) => ({ ...f, password: e.target.value }))}
                  onKeyDown={onEnter(doSignup)}
                />
              </div>
              <button className="btn btn-accent btn-block btn-lg" onClick={doSignup} disabled={busy}>
                {busy ? 'Création…' : 'Créer mon compte'}
              </button>
              <div className="muted-links">
                En continuant, vous acceptez nos <Link to="/contact">conditions</Link>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
