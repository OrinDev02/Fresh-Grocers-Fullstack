import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { ROUTES } from '../../utils/constants';
import type { UserRole } from '../../types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAppSelector(
    (state) => state.auth
  );

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.SELECT_ROLE} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.SELECT_ROLE} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
