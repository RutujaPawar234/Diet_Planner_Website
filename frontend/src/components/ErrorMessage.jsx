import { CircleAlert, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  if (!message) return null;
  return (
    <div className="alert alert-error" role="alert">
      <CircleAlert aria-hidden="true" />
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-sm btn-outline alert-action" onClick={onRetry}>
          <RefreshCw /> Retry
        </button>
      )}
    </div>
  );
}
