import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ListingPage from './pages/ListingPage';
import LoginPage from './pages/LoginPage';
import PublishPage from './pages/PublishPage';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Arbre de routes de l'application.
 * Les fournisseurs (thème, toasts, auth) enveloppent toute l'appli ; les routes
 * sous <ProtectedRoute> exigent une session (autorisation fine côté serveur).
 */
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                {/* Public */}
                <Route index element={<HomePage />} />
                <Route path="/recherche" element={<SearchPage />} />
                <Route path="/logement/:id" element={<ListingPage />} />
                <Route path="/connexion" element={<LoginPage />} />
                <Route path="/abonnement" element={<SubscriptionPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Authentifié */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/publier" element={<PublishPage />} />
                  <Route path="/tableau-de-bord" element={<DashboardPage />} />
                  <Route path="/messagerie" element={<MessagesPage />} />
                  <Route path="/profil" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
