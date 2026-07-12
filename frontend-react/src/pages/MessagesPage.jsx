import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { getConversations, getMessages, sendMessage } from '../lib/api';
import { timeAgo } from '../lib/utils';
import Spinner from '../components/Spinner';

const initials = (name = '') =>
  name
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** Messagerie temps réel (léger polling) entre locataire et propriétaire. */
export default function MessagesPage() {
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState(null);
  const [activeId, setActiveId] = useState(params.get('c') ? Number(params.get('c')) : null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const msgsEndRef = useRef(null);

  const loadConversations = () =>
    getConversations()
      .then((list) => {
        setConversations(list || []);
        // Sélection par défaut : celle de l'URL, sinon la première.
        setActiveId((cur) => cur ?? (list?.[0]?.id ?? null));
        return list;
      })
      .catch(() => setConversations([]));

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charge les messages du fil actif + rafraîchit périodiquement.
  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    const load = () =>
      getMessages(activeId)
        .then((list) => alive && setMessages(list || []))
        .catch(() => {});
    load();
    const t = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [activeId]);

  // Auto-scroll vers le dernier message.
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const active = conversations?.find((c) => c.id === activeId);

  const send = async () => {
    const body = draft.trim();
    if (!body || !activeId) return;
    setSending(true);
    // Optimiste : on affiche le message tout de suite.
    const optimistic = { id: `tmp-${Date.now()}`, body, mine: true, created_at: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    setDraft('');
    try {
      await sendMessage(activeId, body);
      const fresh = await getMessages(activeId);
      setMessages(fresh || []);
      loadConversations();
    } catch {
      // En cas d'échec, on retire le message optimiste.
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  if (conversations === null) {
    return (
      <div className="container p-msg">
        <Spinner full />
      </div>
    );
  }

  return (
    <div className="container p-msg">
      <div className="chat">
        <div className="convos">
          <div className="convo-head">Messages</div>
          {conversations.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--muted)', fontSize: 14 }}>
              Aucune conversation. Contactez un propriétaire depuis une annonce pour démarrer un
              échange.
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={'convo' + (c.id === activeId ? ' active' : '')}
                onClick={() => setActiveId(c.id)}
              >
                <div className="av">
                  {initials(c.counterpart?.name)}
                  <span className="on"></span>
                </div>
                <div className="c">
                  <b>
                    {c.counterpart?.name || 'Utilisateur'}{' '}
                    <small>{c.last_message ? timeAgo(c.last_message.created_at) : ''}</small>
                  </b>
                  <p>
                    {c.last_message?.body || (c.listing ? 'À propos de : ' + c.listing.title : 'Nouvelle conversation')}
                    {c.unread > 0 && <span className="unread">{c.unread}</span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="thread">
          {active ? (
            <>
              <div className="thread-head">
                <div className="av">
                  {initials(active.counterpart?.name)}
                  <span className="on"></span>
                </div>
                <div>
                  <div className="nm">{active.counterpart?.name}</div>
                  <div className="st live">
                    <span className="dot"></span>
                    {active.listing ? active.listing.title : 'en ligne'}
                  </div>
                </div>
              </div>
              <div className="msgs">
                {messages.map((m) => (
                  <div key={m.id} className={'bubble ' + (m.mine ? 'me' : 'them')}>
                    {m.body}
                    <small>{timeAgo(m.created_at)}</small>
                  </div>
                ))}
                <div ref={msgsEndRef} />
              </div>
              <div className="composer">
                <input
                  placeholder="Écrivez un message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                />
                <button className="btn btn-primary" onClick={send} disabled={sending}>
                  Envoyer
                </button>
              </div>
            </>
          ) : (
            <div className="empty-thread">
              <div>
                <div style={{ marginBottom: 10, color: 'var(--primary)' }}>
                  <MessageCircle size={44} strokeWidth={1.6} />
                </div>
                <b>Sélectionnez une conversation</b>
                <p className="mut">ou contactez un propriétaire depuis une annonce.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
