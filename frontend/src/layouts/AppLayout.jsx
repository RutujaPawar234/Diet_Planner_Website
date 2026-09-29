import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { DietProvider } from '../context/DietContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatLongDate } from '../utils/format';
import { todayISO } from '../utils/date';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/planner': 'Diet Planner',
  '/meals': 'Meals',
  '/progress': 'Progress',
  '/profile': 'Profile',
  '/tools/calculator': 'BMI & Calories',
  '/admin': 'Admin Panel',
};

/**
 * Shell for every authenticated page: sidebar + topbar + page outlet.
 * DietProvider lives here so each signed-in session starts with fresh plan state.
 */
export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out');
    navigate('/login', { replace: true });
  };

  return (
    <DietProvider>
      <div className="app-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />
        <div className="app-main">
          <header className="topbar">
            <button className="icon-btn topbar-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu />
            </button>
            <span className="topbar-title">{TITLES[pathname] ?? 'NutriPlan'}</span>
            <div className="topbar-right">
              <span className="small muted hide-sm">{formatLongDate(todayISO())}</span>
              {pathname !== '/planner' && (
                <Link to="/planner" className="btn btn-primary btn-sm" aria-label="Plan meals">
                  <Plus /> <span className="hide-sm">Plan meals</span>
                </Link>
              )}
            </div>
          </header>
          <main className="page">
            <Outlet />
          </main>
        </div>
      </div>
    </DietProvider>
  );
}
