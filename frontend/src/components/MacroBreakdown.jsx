import { MACRO_COLORS } from '../utils/constants';
import { formatNumber } from '../utils/format';

const MACROS = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbohydrates', label: 'Carbs' },
  { key: 'fats', label: 'Fat' },
];

/** Planned grams of each macro against the profile's daily macro targets. */
export default function MacroBreakdown({ totals = {}, targets = {} }) {
  return (
    <div className="stack" style={{ gap: 14 }}>
      {MACROS.map(({ key, label }) => {
        const value = totals[key] || 0;
        const target = targets[key] || 0;
        const pct = target ? Math.min(100, (value / target) * 100) : 0;
        return (
          <div className="macro-row" key={key}>
            <div className="row-between">
              <span className="bold">
                <span className="macro-dot" style={{ background: MACRO_COLORS[key] }} />
                {label}
              </span>
              <span className="muted num">
                <strong style={{ color: 'var(--text)' }}>{formatNumber(value)}</strong> / {formatNumber(target)} g
              </span>
            </div>
            <div className="bar">
              <span style={{ width: `${pct}%`, background: MACRO_COLORS[key] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
