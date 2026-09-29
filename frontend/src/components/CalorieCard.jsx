import { formatNumber } from '../utils/format';

/** Calorie ring: consumed vs target, with planned and remaining underneath. */
export default function CalorieCard({ target = 0, consumed = 0, planned = 0, size = 190, title = 'Calories today' }) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = target ? Math.min(consumed / target, 1) : 0;
  const over = target && consumed > target;
  const remaining = Math.max(0, target - consumed);

  return (
    <div className="card card-pad calorie-card fade-up">
      <div className="row-between">
        <div>
          <div className="card-title">{title}</div>
          <div className="card-subtitle">Tick meals as eaten in your plan</div>
        </div>
      </div>
      <div className={`ring ${over ? 'over' : ''}`} style={{ margin: '18px auto 8px', width: size, height: size }}>
        <svg width={size} height={size} aria-hidden="true">
          <defs>
            <linearGradient id="calorie-ring-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFC857" />
              <stop offset="55%" stopColor="#FF6B4A" />
              <stop offset="100%" stopColor="#F0532F" />
            </linearGradient>
          </defs>
          <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
          <circle
            className="ring-value"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
          />
        </svg>
        <div className="ring-center">
          <strong className="num">{formatNumber(over ? consumed - target : remaining)}</strong>
          <span>{over ? 'kcal over target' : 'kcal remaining'}</span>
        </div>
      </div>
      <div className="calorie-legend">
        <div>
          <span>Consumed</span>
          <strong className="num">{formatNumber(consumed)}</strong>
        </div>
        <div>
          <span>Planned</span>
          <strong className="num">{formatNumber(planned)}</strong>
        </div>
        <div>
          <span>Target</span>
          <strong className="num">{formatNumber(target)}</strong>
        </div>
      </div>
    </div>
  );
}
