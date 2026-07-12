import { useState } from 'react';
import { KeyRound, Home, ShieldCheck, User, BadgeCheck, AlertTriangle } from 'lucide-react';
import { updateProfile, enableOwnerSpace } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLE_LABELS = {
  tenant: [KeyRound, 'Locataire'],
  owner: [Home, 'Propriétaire'],
  admin: [ShieldCheck, 'Admin'],
};

/** Profil de l'utilisateur : édition des informations + activation espace propriétaire. */
export default function ProfilePage() {
  const { user, isOwner, refreshUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
    instagram: user?.instagram || '',
    locale: user?.locale || 'fr',
  });
  const [saving, setSaving] = useState(false);
  const [enabling, setEnabling] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const initials =
    (user?.name || '')
      .split(' ')
      .map((x) => x[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: form.name,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        instagram: form.instagram || null,
        locale: form.locale,
      });
      refreshUser(updated);
      toast(<BadgeCheck size={18} />, 'Profil mis à jour', 'Vos informations ont été enregistrées', true);
    } catch (e) {
      const msg = e.errors ? Object.values(e.errors).flat().join(' ') : e.message;
      toast(<AlertTriangle size={18} />, 'Échec', msg || 'Réessayez plus tard');
    } finally {
      setSaving(false);
    }
  };

  const activateOwner = async () => {
    setEnabling(true);
    try {
      const updated = await enableOwnerSpace();
      refreshUser(updated);
      toast(<Home size={18} />, 'Espace propriétaire activé', 'Vous pouvez maintenant publier des annonces');
    } catch (e) {
      toast(<AlertTriangle size={18} />, 'Erreur', e.message || 'Réessayez plus tard');
    } finally {
      setEnabling(false);
    }
  };

  return (
    <div className="p-profil">
      <h1>Mon profil</h1>
      <div className="sub">Gérez vos informations personnelles et vos espaces.</div>

      <div className="pcard">
        <div className="idhead">
          <div className="bigav">{initials || <User size={26} />}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{user?.name}</div>
            <div className="mut" style={{ fontSize: 14 }}>
              {user?.email}
            </div>
            <div className="roles-badges">
              {(user?.roles || []).map((r) => {
                const [Ic, label] = ROLE_LABELS[r] || [null, r];
                return (
                  <span className="tag" key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    {Ic && <Ic size={13} />} {label}
                  </span>
                );
              })}
              {user?.is_verified && (
                <span className="verified" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <BadgeCheck size={13} /> Vérifié
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pcard">
        <h3>Informations</h3>
        <div className="grid2">
          <div className="field">
            <label className="lab">Nom complet</label>
            <input className="input" value={form.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label className="lab">Téléphone</label>
            <input className="input" placeholder="+221 77 123 45 67" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="field">
            <label className="lab">Email</label>
            <input className="input" value={user?.email || ''} disabled />
          </div>
          <div className="field">
            <label className="lab">Langue</label>
            <select className="input" value={form.locale} onChange={set('locale')}>
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="wo">Wolof</option>
            </select>
          </div>
        </div>

        <h3 style={{ marginTop: 22 }}>Contact affiché sur vos annonces</h3>
        <p className="mut" style={{ fontSize: 14, marginBottom: 6 }}>
          Ces coordonnées apparaissent sur vos annonces pour que les locataires vous contactent
          directement (boutons Appeler / WhatsApp / Instagram).
        </p>
        <div className="grid2">
          <div className="field">
            <label className="lab">WhatsApp</label>
            <input
              className="input"
              placeholder="+221 77 123 45 67"
              value={form.whatsapp}
              onChange={set('whatsapp')}
            />
          </div>
          <div className="field">
            <label className="lab">Instagram</label>
            <input
              className="input"
              placeholder="votre_pseudo (sans @)"
              value={form.instagram}
              onChange={set('instagram')}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ marginTop: 8 }}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {!isOwner && (
        <div className="pcard">
          <h3>Espace propriétaire</h3>
          <p className="mut" style={{ marginBottom: 16, fontSize: 14.5 }}>
            Vous souhaitez proposer un logement ? Activez votre espace propriétaire pour publier des
            annonces et accéder à votre tableau de bord.
          </p>
          <button className="btn btn-accent" onClick={activateOwner} disabled={enabling}>
            {enabling ? (
              'Activation…'
            ) : (
              <>
                <Home size={17} /> Activer l'espace propriétaire
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
