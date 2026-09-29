import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate, formatNumber } from '../utils/format';
import { CHART, PALETTE } from '../utils/theme';

function WeekTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="tiny muted">{formatDate(d.date)}</div>
      <div className="small">
        Eaten <strong className="num">{formatNumber(d.consumed)}</strong> kcal
      </div>
      <div className="small muted">Planned {formatNumber(d.planned)} kcal</div>
    </div>
  );
}

/** Last 7 days: planned vs eaten calories, with the daily target line. */
export default function WeeklyChart({ data = [], target, height = 240 }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barGap={3}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDate(d, { weekday: 'short' })}
            tick={CHART.tick}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={CHART.tick} axisLine={false} tickLine={false} width={56} />
          <Tooltip content={<WeekTooltip />} cursor={{ fill: CHART.cursor }} />
          {target > 0 && <ReferenceLine y={target} stroke={PALETTE.purple} strokeDasharray="5 5" />}
          <Bar dataKey="planned" fill={PALETTE.coralSoft} radius={[6, 6, 0, 0]} maxBarSize={22} isAnimationActive={false} />
          <Bar dataKey="consumed" fill={PALETTE.coral} radius={[6, 6, 0, 0]} maxBarSize={22} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
