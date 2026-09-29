import { Check, Leaf } from 'lucide-react';
import Logo from '../components/Logo';

const POINTS = [
  'Personalised calorie target from your profile',
  'Daily meal plans that respect your diet & allergies',
  'Progress chart that keeps you motivated',
];

/** Split-screen shell shared by the Login and Register pages. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Logo />
        <div className="auth-aside-body">
          <span className="auth-badge">
            <Leaf size={14} /> Wellness, planned simply
          </span>
          <h2>Your nutrition, organised in one calm place.</h2>
          <ul>
            {POINTS.map((p) => (
              <li key={p}>
                <span>
                  <Check size={14} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="auth-aside-foot">For general wellness planning — not medical advice.</p>
      </aside>
      <main className="auth-main">
        <div className="auth-card fade-up">
          <div className="auth-mobile-logo">
            <Logo />
          </div>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
