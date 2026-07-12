import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * Garde de route : exige une session. Redirige vers /connexion en mémorisant
 * la destination pour y revenir après login. L'autorisation fine (rôles) reste
 * vérifiée côté serveur à chaque appel API.
 */
export default function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner full />;

  if (!isLoggedIn) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
