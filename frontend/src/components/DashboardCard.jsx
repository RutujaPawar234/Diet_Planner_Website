/** KPI card. tone: coral | purple | yellow | pink | blue — sets the icon colour and the card's top accent. */
export default function DashboardCard({ label, value, unit, hint, icon: Icon, tone = 'coral', children }) {
  return (
    <div className={`card stat-card fade-up tone-${tone}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <span className="stat-icon">
            <Icon aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="stat-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {hint && <div className="stat-hint">{hint}</div>}
      {children}
    </div>
  );
}
