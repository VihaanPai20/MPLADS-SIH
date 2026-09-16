import { Navigate } from 'react-router-dom';
import { useRole } from '../../contexts/RoleContext';
import { hasAccess, type RoutePath } from '../../auth/permissions';

interface RoleGuardProps {
  route: RoutePath;
  children: React.ReactNode;
}

/**
 * RoleGuard silently redirects unauthorized users back to /dashboard.
 * No "Access Denied" screen — the user simply never sees the page.
 */
export function RoleGuard({ route, children }: RoleGuardProps) {
  const { role } = useRole();

  if (!hasAccess(role, route)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
