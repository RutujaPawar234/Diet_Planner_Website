import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate } from '../utils/format';
import { CHART, PALETTE } from '../utils/theme';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="tiny muted">{formatDate(point.date, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
      <div className="bold num">{point.weight} kg</div>
    </div>
  );
}

/** Weight over time, with an optional dashed target-weight line. */
export default function ProgressChart({ entries = [], targetWeight, height = 280 }) {
  const weights = entries.map((e) => e.weight).concat(targetWeight ? [targetWeight] : []);
  const min = Math.floor(Math.min(...weights) - 1);
  const max = Math.ceil(Math.max(...weights) + 1);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={entries} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.purple} stopOpacity={0.22} />
              <stop offset="100%" stopColor={PALETTE.pink} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDate(d, { day: 'numeric', month: 'short' })}
            tick={CHART.tick}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis domain={[min, max]} tick={CHART.tick} axisLine={false} tickLine={false} unit=" kg" width={64} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: PALETTE.purpleSoft }} />
          {targetWeight && (
            <ReferenceLine
              y={targetWeight}
              stroke={PALETTE.coral}
              strokeDasharray="5 5"
              label={{ value: `Target ${targetWeight} kg`, position: 'insideTopRight', fill: '#C23A1C', fontSize: 12 }}
            />
          )}
          <Area
            type="monotone"
            dataKey="weight"
            stroke={PALETTE.purple}
            strokeWidth={2.5}
            fill="url(#weightFill)"
            dot={{ r: 3.5, fill: '#fff', stroke: PALETTE.purple, strokeWidth: 2 }}
            activeDot={{ r: 5.5 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
