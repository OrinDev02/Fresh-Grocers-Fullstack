import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import type { UserRole } from '../../types';
import { ROUTES, USER_ROLES } from '../../utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === USER_ROLES.CUSTOMER) {
      return <Navigate to={ROUTES.CUSTOMER_HOME} replace />;
    }
    if (user.role === USER_ROLES.DELIVERY_PERSON) {
      return <Navigate to={ROUTES.DELIVERY_DASHBOARD} replace />;
    }
    if (user.role === USER_ROLES.CSR) {
      return <Navigate to={ROUTES.CSR_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;