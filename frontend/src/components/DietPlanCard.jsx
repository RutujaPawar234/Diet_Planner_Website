import { Check, Coffee, Cookie, Moon, Plus, Sun, Trash2 } from 'lucide-react';
import { DietBadge } from './MealCard';
import { formatNumber } from '../utils/format';

const SLOT_ICONS = { breakfast: Coffee, lunch: Sun, snacks: Cookie, dinner: Moon };
const SERVING_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];

/**
 * One meal slot (breakfast / lunch / snacks / dinner) of a day's plan.
 * Read-only when no handlers are passed (e.g. on the dashboard).
 */
export default function DietPlanCard({ slot, label, entries = [], budget, onAdd, onToggle, onServings, onRemove, busy, compact }) {
  const Icon = SLOT_ICONS[slot] ?? Coffee;
  const total = entries.reduce((sum, e) => sum + e.meal.calories * e.servings, 0);
  const editable = Boolean(onRemove);

  return (
    <section className={`card slot-card slot-card-${slot} ${compact ? 'compact' : ''}`}>
      <header className="slot-head">
        <span className={`slot-icon slot-${slot}`}>
          <Icon aria-hidden="true" />
        </span>
        <div className="grow">
          <h3 className="slot-title">{label}</h3>
          <p className="tiny muted num">
            {formatNumber(total)} kcal{budget ? ` of ~${formatNumber(budget)} suggested` : ''}
          </p>
        </div>
        {onAdd && (
          <button className="btn btn-soft btn-sm" onClick={() => onAdd(slot)} disabled={busy}>
            <Plus /> Add
          </button>
        )}
      </header>

      {entries.length === 0 ? (
        <p className="slot-empty">No meals planned yet.</p>
      ) : (
        <ul className="slot-list">
          {entries.map((entry) => (
            <li key={entry._id} className={`slot-item ${entry.consumed ? 'done' : ''}`}>
              {onToggle ? (
                <button
                  className={`check ${entry.consumed ? 'on' : ''}`}
                  onClick={() => onToggle(entry)}
                  disabled={busy}
                  aria-pressed={entry.consumed}
                  aria-label={entry.consumed ? `Mark ${entry.meal.name} as not eaten` : `Mark ${entry.meal.name} as eaten`}
                >
                  <Check />
                </button>
              ) : (
                <span className={`check static ${entry.consumed ? 'on' : ''}`} aria-hidden="true">
                  <Check />
                </span>
              )}
              <div className="grow slot-item-main">
                <div className="slot-item-name">{entry.meal.name}</div>
                <div className="slot-item-meta">
                  {!compact && <DietBadge type={entry.meal.dietaryType} />}
                  <span className="num">
                    P {formatNumber(entry.meal.protein * entry.servings)}g · C {formatNumber(entry.meal.carbohydrates * entry.servings)}g · F{' '}
                    {formatNumber(entry.meal.fats * entry.servings)}g
                  </span>
                </div>
                {!compact && entry.meal.ingredients?.length > 0 && (
                  <div className="tiny muted slot-ingredients">{entry.meal.ingredients.join(', ')}</div>
                )}
              </div>
              {editable ? (
                <select
                  className="select servings-select"
                  value={entry.servings}
                  onChange={(e) => onServings(entry, Number(e.target.value))}
                  disabled={busy}
                  aria-label="Servings"
                >
                  {[...new Set([...SERVING_OPTIONS, entry.servings])].sort((a, b) => a - b).map((s) => (
                    <option key={s} value={s}>
                      {s}×
                    </option>
                  ))}
                </select>
              ) : (
                entry.servings !== 1 && <span className="badge">{entry.servings}×</span>
              )}
              <span className="slot-kcal num">{formatNumber(entry.meal.calories * entry.servings)} kcal</span>
              {editable && (
                <button className="icon-btn danger" onClick={() => onRemove(entry)} disabled={busy} aria-label={`Remove ${entry.meal.name}`}>
                  <Trash2 />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
