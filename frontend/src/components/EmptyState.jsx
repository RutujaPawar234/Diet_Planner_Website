import { Sprout } from 'lucide-react';

export default function EmptyState({ icon: Icon = Sprout, title, description, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
