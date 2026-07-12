import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Système de notifications « toast » global. Un composant appelle
 * `toast(icon, title, subtitle?)` ; l'affichage/disparition est géré ici.
 */
const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (icon, title, sub, accent = false) => {
      const id = ++idSeq;
      setToasts((list) => [...list, { id, icon, title, sub, accent }]);
      setTimeout(() => remove(id), 3800);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div id="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={'toast' + (t.accent ? ' accent' : '')}>
            <span className="ti">{t.icon}</span>
            <div>
              <b>{t.title}</b>
              {t.sub && <small>{t.sub}</small>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans <ToastProvider>');
  return ctx;
}
