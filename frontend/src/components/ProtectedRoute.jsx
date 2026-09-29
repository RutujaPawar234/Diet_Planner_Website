import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

/** Where a signed-in user belongs: admins without a health profile go to the admin panel. */
// eslint-disable-next-line react-refresh/only-export-components
export const homePath = (user, hasProfile) => {
  if (hasProfile) return '/dashboard';
  return user?.role === 'admin' ? '/admin' : '/onboarding';
};

/**
 * Guards private routes on the client.
 *  - not logged in        → /login (remembers where the user was going)
 *  - roles given & no match → /dashboard
 *  - requireProfile & no profile → /onboarding
 * The API enforces the same rules server-side; this only improves UX.
 */
export default function ProtectedRoute({ roles, requireProfile = false, children }) {
  const { status, user, hasProfile } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <LoadingSpinner fullScreen label="Restoring your session…" />;

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  if (requireProfile && !hasProfile) return <Navigate to={homePath(user, hasProfile)} replace />;

  return children ?? <Outlet />;
}

/** Public-only pages (login/register): signed-in users are sent to the app. */
export function GuestRoute({ children }) {
  const { status, user, hasProfile } = useAuth();
  if (status === 'checking') return <LoadingSpinner fullScreen label="Loading…" />;
  if (status === 'authenticated') return <Navigate to={homePath(user, hasProfile)} replace />;
  return children ?? <Outlet />;
}
