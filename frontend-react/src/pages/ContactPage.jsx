import { useState } from 'react';
import { MapPin, Mail, Phone, Clock, AlertTriangle, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

/** Page de contact (formulaire de démonstration + coordonnées). */
export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast(<AlertTriangle size={18} />, 'Champs manquants', 'Remplissez tous les champs');
      return;
    }
    toast(<Send size={18} />, 'Message envoyé', 'Notre équipe vous répondra sous 24 h', true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="p-contact">
      <div className="chead">
        <h1>Contactez-nous</h1>
        <p>Une question, un signalement, un partenariat ? Nous sommes à votre écoute.</p>
      </div>

      <div className="cgrid">
        <div className="info">
          <h3>Coordonnées</h3>
          <div className="row">
            <span className="e">
              <MapPin size={20} />
            </span>
            <div>
              <b>Adresse</b>
              <br />
              Plateau, Dakar, Sénégal
            </div>
          </div>
          <div className="row">
            <span className="e">
              <Mail size={20} />
            </span>
            <div>
              <b>Email</b>
              <br />
              contact@terangaloc.sn
            </div>
          </div>
          <div className="row">
            <span className="e">
              <Phone size={20} />
            </span>
            <div>
              <b>Téléphone</b>
              <br />
              +221 33 800 00 00
            </div>
          </div>
          <div className="row">
            <span className="e">
              <Clock size={20} />
            </span>
            <div>
              <b>Horaires</b>
              <br />
              Lun – Sam · 9h – 19h
            </div>
          </div>
        </div>

        <form className="cform" onSubmit={submit}>
          <div className="field">
            <label className="lab">Nom complet</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="Votre nom" />
          </div>
          <div className="field">
            <label className="lab">Email</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="vous@exemple.com" />
          </div>
          <div className="field">
            <label className="lab">Message</label>
            <textarea className="input" rows={5} value={form.message} onChange={set('message')} placeholder="Votre message…" />
          </div>
          <button className="btn btn-primary btn-block btn-lg">Envoyer le message</button>
        </form>
      </div>
    </div>
  );
}
