import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import Landing from './pages/Landing';

// Code-split every page except the landing page so the first load stays small.
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DietPlanner = lazy(() => import('./pages/DietPlanner'));
const Meals = lazy(() => import('./pages/Meals'));
const Progress = lazy(() => import('./pages/Progress'));
const Profile = lazy(() => import('./pages/Profile'));
const Calculator = lazy(() => import('./pages/Calculator'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** Scrolls to the top on navigation, or to #section when the URL has a hash. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) return el.scrollIntoView({ behavior: 'smooth' });
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Suspense fallback={<LoadingSpinner fullScreen label="" />}>
        <Routes>
          {/* Public marketing pages */}
          <Route element={<PublicLayout />}>
            <Route index element={<Landing />} />
            <Route path="calculator" element={<Calculator />} />
          </Route>

          {/* Guest-only auth pages */}
          <Route path="login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Signed in, profile not required yet */}
          <Route path="onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

          {/* Signed-in app shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Nutrition features need a completed profile */}
              <Route element={<ProtectedRoute requireProfile />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="planner" element={<DietPlanner />} />
                <Route path="progress" element={<Progress />} />
                <Route path="profile" element={<Profile />} />
                <Route path="tools/calculator" element={<Calculator embedded />} />
              </Route>
              {/* Meal catalog and admin panel work without a health profile (e.g. for admins) */}
              <Route path="meals" element={<Meals />} />
              <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
