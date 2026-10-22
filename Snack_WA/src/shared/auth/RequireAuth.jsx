import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { ROUTES } from '../constants/routes';

export default function RequireAuth({ children }) {
  const token = useAuthStore((state) => state.token); const location = useLocation();
  return token ? children : <Navigate replace to={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(location.pathname + location.search)}`} />;
}
