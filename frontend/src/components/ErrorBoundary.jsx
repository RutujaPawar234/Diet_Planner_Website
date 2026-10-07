import { Component } from 'react';
import { RefreshCw } from 'lucide-react';
import { LogoMark } from './Logo';

/** Catches render errors anywhere below it so users never see a blank page. */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected UI error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="not-found">
        <LogoMark />
        <h1>Something went wrong</h1>
        <p className="muted">The page failed to load. Reloading usually fixes it — your data is safe.</p>
        <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>
          <RefreshCw /> Reload page
        </button>
      </div>
    );
  }
}
