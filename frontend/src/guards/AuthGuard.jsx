import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import Loading from '../components/layout/Loading';

export function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  console.log(isAuthenticated, isLoading, "VARIABLES DE AUTH GUARD");

  if (isLoading) {
    return <Loading />; // Muestra un spinner mientras verifica la autenticación
  }

  if (!isAuthenticated) {
    // Redirige al login, pero guarda la ubicación para volver después del login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <><Outlet /></>;
}