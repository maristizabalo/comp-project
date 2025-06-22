import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

export function PublicGuard({ children }) {
    const { isAuthenticated } = useAuth();
    console.log(isAuthenticated, "ESTE ES DE PUBLIC GUARD");

    if (isAuthenticated) {
        return <Navigate to="/private/dashboard" replace />;
    }

    return <Outlet />;
}