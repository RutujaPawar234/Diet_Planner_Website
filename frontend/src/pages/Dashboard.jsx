import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, HeartPulse, Scale, Sparkles, Target, TrendingDown, TrendingUp } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import CalorieCard from '../components/CalorieCard';
import DietPlanCard from '../components/DietPlanCard';
import MacroBreakdown from '../components/MacroBreakdown';
import ProgressChart from '../components/ProgressChart';
import WeeklyChart from '../components/WeeklyChart';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Disclaimer from '../components/Disclaimer';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { dashboardService } from '../services/dashboardService';
import { dietService } from '../services/dietService';
import { DIETARY_TYPES, GOALS, MEAL_SLOTS, labelOf } from '../utils/constants';
import { firstName, formatNumber } from '../utils/format';
import { greeting, todayISO } from '../utils/date';
import { bmiInfo } from '../utils/health';
import { PALETTE } from '../utils/theme';

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const toast = useToast();
  const today = todayISO();
  const { data, loading, error, refetch } = useFetch(() => dashboardService.get(today), [today]);
  const [busy, setBusy] = useState(false);

  if (loading && !data) return <LoadingSpinner label="Loading your dashboard…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={refetch} />;

  const { profile, calories, plan, progress, week } = data;
  const change = progress.change;

  const run = async (request, success) => {
    setBusy(true);
    try {
      await request();
      if (success) toast.success(success);
      await refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleEaten = (entry) => run(() => dietService.updateEntry(plan._id, entry._id, { consumed: !entry.consumed }));
  const generate = () => run(() => dietService.generate(today), 'Today’s plan is ready');

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">
            {greeting()}, {firstName(user?.name)}
          </h1>
          <p className="page-subtitle">Here’s your nutrition snapshot for today.</p>
        </div>
        <div className="row wrap">
          <span className="badge badge-coral">
            <Target /> {labelOf(GOALS, profile.goal)}
          </span>
          <span className="badge">{labelOf(DIETARY_TYPES, profile.dietaryPreference)}</span>
        </div>
      </div>

      <div className="grid grid-4">
        <DashboardCard
          label="Current weight"
          icon={Scale}
          tone="yellow"
          value={formatNumber(progress.currentWeight, 1)}
          unit="kg"
          hint={
            progress.totalEntries > 1 ? (
              <span className={`trend ${change < 0 ? 'down' : change > 0 ? 'up' : ''}`}>
                {change < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                {change > 0 ? '+' : ''}
                {change} kg since start
              </span>
            ) : (
              <Link to="/progress">Log your first weigh-in</Link>
            )
          }
        />
        <DashboardCard label="BMI" icon={HeartPulse} tone="purple" value={profile.bmi} hint={`${bmiInfo(profile.bmi).label} range · screening only`} />
        <DashboardCard label="Daily goal" icon={Target} tone="coral" value={formatNumber(calories.target)} unit="kcal" hint={`BMR ${formatNumber(profile.bmr)} · TDEE ${formatNumber(profile.tdee)}`} />
        <DashboardCard label="Consumed" icon={Flame} tone="pink" value={formatNumber(calories.consumed)} unit="kcal" hint={`${formatNumber(calories.remaining)} kcal remaining`} />
      </div>

      <div className="grid grid-main-side">
        <div className="stack" style={{ gap: 18, minWidth: 0 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Today’s meals</div>
                <div className="card-subtitle">
                  {plan ? `${formatNumber(calories.planned)} kcal planned · tap ✓ when eaten` : 'No plan for today yet'}
                </div>
              </div>
              <Link to="/planner" className="btn btn-outline btn-sm">
                Open planner <ArrowRight />
              </Link>
            </div>
            {plan ? (
              <div className="card-body dashboard-slots">
                {MEAL_SLOTS.map((s) => (
                  <DietPlanCard key={s.value} slot={s.value} label={s.label} entries={plan[s.value]} onToggle={toggleEaten} busy={busy} compact />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="Let’s plan today"
                description="Generate a balanced day of meals that matches your calorie target, diet and allergies."
                action={
                  <button className="btn btn-primary" onClick={generate} disabled={busy}>
                    {busy ? <span className="spinner sm" /> : <Sparkles />} Generate today’s plan
                  </button>
                }
              />
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Last 7 days</div>
                <div className="card-subtitle">Planned vs eaten calories · dashed line is your target</div>
              </div>
              <div className="chart-legend">
                <span>
                  <i style={{ background: PALETTE.coralSoft }} /> Planned
                </span>
                <span>
                  <i style={{ background: PALETTE.coral }} /> Eaten
                </span>
              </div>
            </div>
            <div className="card-body">
              <WeeklyChart data={week} target={calories.target} />
            </div>
          </div>
        </div>

        <div className="stack" style={{ gap: 18 }}>
          <CalorieCard target={calories.target} consumed={calories.consumed} planned={calories.planned} />

          <div className="card card-pad">
            <div className="card-title">Macros planned today</div>
            <div className="card-subtitle" style={{ marginBottom: 16 }}>
              Against a 25 / 50 / 25 split of your target
            </div>
            <MacroBreakdown
              totals={{ protein: plan?.totalProtein, carbohydrates: plan?.totalCarbohydrates, fats: plan?.totalFats }}
              targets={profile.macroTargets}
            />
          </div>

          <div className="card card-pad">
            <div className="row-between" style={{ marginBottom: 8 }}>
              <div className="card-title">Weight trend</div>
              <Link to="/progress" className="small bold">
                View all
              </Link>
            </div>
            {progress.entries.length > 1 ? (
              <ProgressChart entries={progress.entries} targetWeight={profile.targetWeight} height={180} />
            ) : (
              <p className="small muted" style={{ padding: '18px 0' }}>
                Log at least two weigh-ins on the Progress page to see your trend.
              </p>
            )}
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
