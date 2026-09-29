import { NavLink } from 'react-router-dom';
import {
  Calculator,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  TrendingUp,
  UserRound,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';
import { initials } from '../utils/format';

const MAIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/planner', label: 'Diet Planner', icon: CalendarDays },
  { to: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

const ACCOUNT_LINKS = [
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/tools/calculator', label: 'BMI & Calories', icon: Calculator },
];

function SideLink({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
      <Icon aria-hidden="true" />
      {label}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose, onLogout }) {
  const { user, isAdmin } = useAuth();

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="App navigation">
        <div className="sidebar-head">
          <Logo to="/dashboard" />
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <X />
          </button>
        </div>

        <nav className="sidebar-nav">
          {MAIN_LINKS.map((link) => (
            <SideLink key={link.to} {...link} onNavigate={onClose} />
          ))}
          <div className="sidebar-section">Account</div>
          {ACCOUNT_LINKS.map((link) => (
            <SideLink key={link.to} {...link} onNavigate={onClose} />
          ))}
          {isAdmin && (
            <>
              <div className="sidebar-section">Admin</div>
              <SideLink to="/admin" label="Admin Panel" icon={ShieldCheck} onNavigate={onClose} />
            </>
          )}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <div className="avatar">{initials(user?.name)}</div>
            <div className="who">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button className="icon-btn" onClick={onLogout} aria-label="Log out" title="Log out">
              <LogOut />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
