import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  const { isAuthenticated } = useAuth();
  return (
    <div className="not-found">
      <Logo />
      <div className="not-found-code">404</div>
      <h1>This page isn’t on the menu</h1>
      <p className="muted">The page you are looking for doesn’t exist or has moved.</p>
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="btn btn-primary btn-lg">
        <ArrowLeft /> {isAuthenticated ? 'Back to dashboard' : 'Back to home'}
      </Link>
    </div>
  );
}
