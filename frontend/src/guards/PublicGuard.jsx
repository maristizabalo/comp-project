import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

export function PublicGuard({ children }) {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/private/dashboard" replace />;
    }

    return <Outlet />;
}