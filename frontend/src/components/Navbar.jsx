import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';

const LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/calculator', label: 'BMI Calculator' },
];

/** Public marketing navbar. */
export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Logo />
        <nav className="nav-links" aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
        <button className="icon-btn nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav className={`mobile-menu ${open ? 'open' : ''}`} aria-label="Mobile">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={close}>
            {l.label}
          </a>
        ))}
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn btn-primary" onClick={close}>
            Open dashboard
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline" onClick={close}>
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary" onClick={close}>
              Get Started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
