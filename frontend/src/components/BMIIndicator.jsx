import { bmiInfo } from '../utils/health';

const TONE_CLASS = { blue: 'badge-blue', success: 'badge-success', amber: 'badge-yellow', red: 'badge-red' };
const SCALE_MIN = 12;
const SCALE_MAX = 40;

/** BMI value, category badge and a colour scale with a marker. */
export default function BMIIndicator({ bmi, compact = false }) {
  if (!bmi) return <p className="muted small">Enter height and weight to see your BMI.</p>;

  const info = bmiInfo(bmi);
  const position = ((Math.min(Math.max(bmi, SCALE_MIN), SCALE_MAX) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

  return (
    <div className="bmi-indicator">
      {!compact && (
        <div className="row" style={{ alignItems: 'baseline' }}>
          <span className="stat-value">{bmi}</span>
          <span className={`badge ${TONE_CLASS[info.tone]}`}>{info.label}</span>
        </div>
      )}
      <div className="bmi-scale" aria-label={`BMI ${bmi}, ${info.label}`}>
        {/* Scale spans BMI 12–40; segment widths are proportional to each range. */}
        <div className="bmi-track">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="bmi-marker" style={{ left: `${position}%` }} />
      </div>
      <div className="bmi-labels">
        <span>Under</span>
        <span>Normal</span>
        <span>Over</span>
        <span>Obese</span>
      </div>
    </div>
  );
}
