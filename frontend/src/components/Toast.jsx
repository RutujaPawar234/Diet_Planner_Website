import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };

export default function Toast({ type = 'info', message, onClose }) {
  const Icon = ICONS[type] ?? Info;
  return (
    <div className={`toast ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" />
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  );
}
