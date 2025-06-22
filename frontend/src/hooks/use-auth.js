import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from '../store/auth/authSlice';

export const useAuth = () => {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return {
    ...authState,
    isAuthenticated: !!authState.token,
    login: (credentials) => dispatch(login(credentials)),
    logout: () => dispatch(logout())
  };
};