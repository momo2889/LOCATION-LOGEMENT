import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../lib/api';
import { tokenStore, userStore } from '../lib/api';

/**
 * Contexte d'authentification global.
 *
 * Source de vérité côté client : le token Sanctum + l'utilisateur en cache.
 * Au montage, si un token existe, on revalide la session via /auth/me
 * (le serveur reste seul juge de la validité et des rôles).
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userStore.get());
  const [loading, setLoading] = useState(!!tokenStore.get());

  // Revalidation de la session au démarrage.
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (creds) => {
    const { user } = await api.login(creds);
    setUser(user);
    return user;
  };

  const register = async (input) => {
    const { user } = await api.register(input);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  // Met à jour l'utilisateur local après une action de profil.
  const refreshUser = (u) => {
    if (u) {
      setUser(u);
      userStore.set(u);
    }
  };

  const hasRole = (role) => (user?.roles || []).includes(role);

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    isOwner: hasRole('owner'),
    isAdmin: hasRole('admin'),
    isVerified: !!user?.is_verified,
    hasRole,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}
