import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home, AlertTriangle, Camera, Rotate3d, CheckCircle2, MapPin,
  Loader2, X, ClipboardCheck, ArrowRight, ArrowLeft,
} from 'lucide-react';
import {
  neighborhoods as fetchNeighborhoods,
  createListing,
  enableOwnerSpace,
  uploadPhotos,
} from '../lib/api';
import { fcfa } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/** Publication d'une annonce en 3 étapes (réservé aux propriétaires). */
export default function PublishPage() {
  const { isOwner, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [hoods, setHoods] = useState([]);
  const [step, setStep] = useState(1);
  const [enabling, setEnabling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cgu, setCgu] = useState(false);
  const [photos, setPhotos] = useState([]); // URLs des photos téléversées
  const [pano, setPano] = useState(''); // URL du panorama 360° (optionnel)
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: '',
    duration: 'longue',
    neighborhood_id: '',
    price: '',
    rooms: '',
    bathrooms: '',
    area: '',
    description: '',
    furnished: false,
    lat: null, // localisation exacte choisie sur la carte
    lng: null,
  });

  // --- Sélecteur de localisation exacte (carte Leaflet) ---
  // Le propriétaire place un point sur la carte : c'est ce point qui apparaîtra
  // ensuite sur la carte de recherche, plutôt que le simple centre du quartier.
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Positionne / déplace le marqueur et mémorise les coordonnées dans le formulaire.
  const setPoint = (lat, lng) => {
    setForm((f) => ({ ...f, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) }));
    const map = mapRef.current;
    if (!map || !window.L) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = window.L.marker([lat, lng], { draggable: true })
        .addTo(map)
        .on('dragend', (ev) => {
          const p = ev.target.getLatLng();
          setPoint(p.lat, p.lng);
        });
    }
  };

  // Initialise la carte quand l'étape 1 (informations) est affichée.
  useEffect(() => {
    if (step !== 1 || !window.L) return;
    const el = document.getElementById('pub-map');
    if (!el || mapRef.current) return;
    const start = form.lat != null && form.lng != null ? [form.lat, form.lng] : [14.7167, -17.4677];
    const map = window.L.map('pub-map', { scrollWheelZoom: false }).setView(start, form.lat != null ? 15 : 12);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);
    map.on('click', (e) => setPoint(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    if (form.lat != null && form.lng != null) setPoint(form.lat, form.lng);
    // Leaflet a parfois besoin d'un recalcul de taille après le montage du conteneur.
    setTimeout(() => map.invalidateSize(), 100);
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Centre la carte sur la position de l'appareil (bouton « Ma position »).
  const locateMe = () => {
    if (!navigator.geolocation) {
      toast(<AlertTriangle size={18} />, 'Non disponible', "La géolocalisation n'est pas supportée");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.setView([latitude, longitude], 16);
        setPoint(latitude, longitude);
      },
      () => toast(<AlertTriangle size={18} />, 'Position refusée', "Autorisez l'accès ou placez le point manuellement"),
    );
  };

  useEffect(() => {
    fetchNeighborhoods()
      .then((list) => setHoods(list || []))
      .catch(() => setHoods([]));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Gate propriétaire : un locataire peut activer son espace propriétaire ici.
  const activateOwner = async () => {
    setEnabling(true);
    try {
      const user = await enableOwnerSpace();
      refreshUser(user);
      toast(<Home size={18} />, 'Espace propriétaire activé', 'Vous pouvez maintenant publier');
    } catch (e) {
      toast(<AlertTriangle size={18} />, 'Erreur', e.message || 'Réessayez plus tard');
    } finally {
      setEnabling(false);
    }
  };

  const go = (n) => {
    if (n === 2) {
      if (!form.title || !form.type || !form.neighborhood_id || !form.price) {
        toast(<AlertTriangle size={18} />, 'Champs manquants', 'Complétez les champs obligatoires');
        return;
      }
      if (form.lat == null || form.lng == null) {
        toast(<AlertTriangle size={18} />, 'Localisation manquante', 'Placez un point sur la carte');
        return;
      }
    }
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Téléverse les photos sélectionnées et mémorise leurs URLs.
  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (photos.length + files.length > 12) {
      toast(<AlertTriangle size={18} />, 'Trop de photos', 'Maximum 12 photos par annonce');
      return;
    }
    setUploading(true);
    try {
      const urls = await uploadPhotos(files);
      setPhotos((p) => [...p, ...urls]);
      toast(<Camera size={18} />, 'Photos ajoutées', `${urls.length} photo(s) téléversée(s)`);
    } catch (err) {
      const msg = err.errors ? Object.values(err.errors).flat().join(' ') : err.message;
      toast(<AlertTriangle size={18} />, 'Upload impossible', msg || 'Réessayez avec des images plus légères');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Téléverse le panorama 360° (une seule image équirectangulaire).
  const handlePano = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const [url] = await uploadPhotos([file]);
      setPano(url || '');
      toast(<Rotate3d size={18} />, 'Visite 360° ajoutée', 'Le panorama sera visible sur la fiche');
    } catch (err) {
      toast(<AlertTriangle size={18} />, 'Upload impossible', err.message || 'Réessayez');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (url) => setPhotos((p) => p.filter((u) => u !== url));

  const submit = async () => {
    if (!cgu) {
      toast(<AlertTriangle size={18} />, 'Confirmation requise', 'Cochez la case pour continuer');
      return;
    }
    setSubmitting(true);
    try {
      const listing = await createListing({
        title: form.title,
        type: form.type,
        duration: form.duration,
        neighborhood_id: Number(form.neighborhood_id),
        price: Number(form.price),
        rooms: Number(form.rooms) || 1,
        bathrooms: Number(form.bathrooms) || 1,
        area: Number(form.area) || 20,
        lat: form.lat ?? undefined,
        lng: form.lng ?? undefined,
        description: form.description || undefined,
        furnished: form.furnished,
        images: photos.length ? photos : undefined,
        pano: pano || undefined,
      });
      toast(<CheckCircle2 size={18} />, 'Annonce publiée !', 'Elle est désormais visible dans la recherche', true);
      navigate(`/logement/${listing.id}`);
    } catch (e) {
      const msg = e.errors ? Object.values(e.errors).flat().join(' ') : e.message;
      toast(<AlertTriangle size={18} />, 'Publication impossible', msg || 'Vérifiez les champs');
      setSubmitting(false);
    }
  };

  // --- Écran de gate si l'utilisateur n'est pas (encore) propriétaire ---
  if (!isOwner) {
    return (
      <div className="p-publish">
        <div className="wrap">
          <div className="hero-s">
            <h1>Devenez propriétaire sur TerangaLoc</h1>
            <p>Activez votre espace propriétaire pour publier des annonces — c'est gratuit.</p>
          </div>
          <div className="form-card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 10, color: 'var(--primary)' }}>
              <Home size={46} strokeWidth={1.6} />
            </div>
            <p className="mut" style={{ marginBottom: 20 }}>
              Votre compte est actuellement en mode locataire. En un clic, débloquez la publication
              d'annonces et votre tableau de bord propriétaire.
            </p>
            <button className="btn btn-primary btn-lg" onClick={activateOwner} disabled={enabling}>
              {enabling ? 'Activation…' : "Activer l'espace propriétaire"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const qLabel = hoods.find((h) => String(h.id) === String(form.neighborhood_id))?.name || '';

  return (
    <div className="p-publish">
      <div className="wrap">
        <div className="hero-s">
          <h1>Publier un logement</h1>
          <p>Votre annonce sera visible immédiatement dans la recherche — c'est gratuit.</p>
        </div>

        <div className="progress">
          <div className="pbar">
            <div className="pfill" style={{ width: `${step * 33.33}%` }}></div>
          </div>
          <div className="pnums">
            <span className={'pnum' + (step >= 1 ? ' on' : '')}>1. Informations</span>
            <span className={'pnum' + (step >= 2 ? ' on' : '')}>2. Photos & 360°</span>
            <span className={'pnum' + (step >= 3 ? ' on' : '')}>3. Vérification</span>
          </div>
        </div>

        <div className="form-card">
          {step === 1 && (
            <div>
              <div className="field">
                <label className="lab">
                  Titre de l'annonce <span className="req">*</span>
                </label>
                <input
                  className="input"
                  placeholder="Ex : Appartement 2 pièces lumineux à Mermoz"
                  value={form.title}
                  onChange={set('title')}
                />
              </div>
              <div className="grid2">
                <div className="field">
                  <label className="lab">
                    Type <span className="req">*</span>
                  </label>
                  <select className="input" value={form.type} onChange={set('type')}>
                    <option value="">Choisir…</option>
                    <option>Studio</option>
                    <option>Chambre</option>
                    <option>Appartement</option>
                    <option>Villa</option>
                  </select>
                </div>
                <div className="field">
                  <label className="lab">Durée</label>
                  <select className="input" value={form.duration} onChange={set('duration')}>
                    <option value="longue">Longue durée (bail)</option>
                    <option value="courte">Courte durée (meublé)</option>
                  </select>
                </div>
                <div className="field">
                  <label className="lab">
                    Quartier <span className="req">*</span>
                  </label>
                  <select className="input" value={form.neighborhood_id} onChange={set('neighborhood_id')}>
                    <option value="">Choisir…</option>
                    {hoods.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                        {n.city && n.city !== n.name ? ' — ' + n.city : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="lab">
                    Loyer mensuel (FCFA) <span className="req">*</span>
                  </label>
                  <input className="input" type="number" placeholder="250000" value={form.price} onChange={set('price')} />
                </div>
                <div className="field">
                  <label className="lab">Chambres</label>
                  <input className="input" type="number" placeholder="2" value={form.rooms} onChange={set('rooms')} />
                </div>
                <div className="field">
                  <label className="lab">Salles de bain</label>
                  <input className="input" type="number" placeholder="1" value={form.bathrooms} onChange={set('bathrooms')} />
                </div>
                <div className="field">
                  <label className="lab">Surface (m²)</label>
                  <input className="input" type="number" placeholder="75" value={form.area} onChange={set('area')} />
                </div>
              </div>
              <div className="field">
                <label className="lab">
                  Localisation exacte <span className="req">*</span>
                </label>
                <p className="mut" style={{ margin: '2px 0 8px', fontSize: 13 }}>
                  Cliquez sur la carte (ou déplacez le repère) pour indiquer l'emplacement précis du
                  logement. C'est ce point qui s'affichera sur la carte de recherche.
                </p>
                <div
                  id="pub-map"
                  style={{
                    height: 260,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid var(--line)',
                    zIndex: 0,
                  }}
                ></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={locateMe}>
                    <MapPin size={15} /> Ma position
                  </button>
                  <span className="mut" style={{ fontSize: 13 }}>
                    {form.lat != null && form.lng != null
                      ? `Point sélectionné : ${form.lat}, ${form.lng}`
                      : 'Aucun point sélectionné'}
                  </span>
                </div>
              </div>
              <div className="field">
                <label className="lab">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Décrivez le logement, le quartier, les atouts…"
                  value={form.description}
                  onChange={set('description')}
                />
              </div>
              <div className="field">
                <label className="lab">Équipements</label>
                <div className="chips" style={{ marginTop: 8 }}>
                  <span
                    className={'chip' + (form.furnished ? ' active' : '')}
                    onClick={() => setForm((f) => ({ ...f, furnished: !f.furnished }))}
                  >
                    Meublé
                  </span>
                  {['Climatisation', 'Parking', 'Internet', 'Gardien', 'Jardin'].map((c) => (
                    <span
                      key={c}
                      className="chip"
                      onClick={(e) => e.currentTarget.classList.toggle('active')}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="actions">
                <Link to="/" className="btn btn-ghost">
                  Annuler
                </Link>
                <button type="button" className="btn btn-primary" onClick={() => go(2)}>
                  Continuer <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="uploads">
                <label className="drop">
                  <div className="ic">
                    <Camera size={30} />
                  </div>
                  <b>Ajouter des photos</b>
                  <span>JPG/PNG/WebP · jusqu'à 12 · 5 Mo max</span>
                  <input type="file" accept="image/*" multiple hidden onChange={handlePhotos} />
                </label>
                <label className="drop vr">
                  <div className="ic">
                    <Rotate3d size={30} />
                  </div>
                  <b>Photo 360° (visite immersive)</b>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {pano ? (
                      <>
                        <CheckCircle2 size={14} /> Ajoutée
                      </>
                    ) : (
                      'Image équirectangulaire · optionnel'
                    )}
                  </span>
                  <input type="file" accept="image/*" hidden onChange={handlePano} />
                </label>
              </div>

              {uploading && (
                <div className="mut" style={{ marginTop: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 size={15} className="spin" /> Téléversement en cours…
                </div>
              )}

              {photos.length > 0 && (
                <div className="photo-grid">
                  {photos.map((url) => (
                    <div className="photo-thumb" key={url}>
                      <img src={url} alt="Photo de l'annonce" />
                      <button
                        type="button"
                        className="rm"
                        onClick={() => removePhoto(url)}
                        title="Retirer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="note" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Rotate3d size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  Une photo 360° permet aux locataires d'explorer le logement comme avec un casque VR
                  — un vrai atout pour se démarquer. Si vous n'ajoutez pas de photo, une image par
                  défaut sera utilisée.
                </span>
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={() => go(1)}>
                  <ArrowLeft size={16} /> Retour
                </button>
                <button type="button" className="btn btn-primary" onClick={() => go(3)} disabled={uploading}>
                  Continuer <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div
                className="note"
                style={{
                  background: 'var(--accent-soft)',
                  borderColor: 'color-mix(in srgb,var(--accent) 30%,transparent)',
                  color: 'var(--accent)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ClipboardCheck size={16} /> Récapitulatif — vérifiez avant d'envoyer
                </span>
              </div>
              <div className="preview">
                <h4>Aperçu de l'annonce</h4>
                <div>
                  <b style={{ color: 'var(--ink)', fontSize: 16 }}>{form.title || '—'}</b>
                  <br />
                  {form.type || '—'} · {qLabel}, Dakar
                  {form.lat != null && form.lng != null && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      {' · '}
                      <MapPin size={13} /> point localisé
                    </span>
                  )}
                  <br />
                  <b style={{ color: 'var(--primary)' }}>{fcfa(Number(form.price) || 0)} FCFA</b> / mois ·{' '}
                  {form.rooms || '—'} ch · {form.area || '—'} m²
                </div>
              </div>
              <label
                className="lab"
                style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'flex-start', fontWeight: 500 }}
              >
                <input type="checkbox" checked={cgu} onChange={(e) => setCgu(e.target.checked)} style={{ marginTop: 3 }} />{' '}
                Je certifie être le propriétaire ou mandataire et accepter les conditions
                d'utilisation.
              </label>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={() => go(2)}>
                  <ArrowLeft size={16} /> Retour
                </button>
                <button type="button" className="btn btn-accent" onClick={submit} disabled={submitting}>
                  {submitting ? (
                    'Publication…'
                  ) : (
                    <>
                      <CheckCircle2 size={17} /> Publier l'annonce
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
