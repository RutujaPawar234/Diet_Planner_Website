import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronLeft, ChevronRight, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import DietPlanCard from '../components/DietPlanCard';
import MealPickerModal from '../components/MealPickerModal';
import MacroBreakdown from '../components/MacroBreakdown';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Disclaimer from '../components/Disclaimer';
import { useDiet } from '../hooks/useDiet';
import { useUser } from '../hooks/useUser';
import { useToast } from '../hooks/useToast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MACRO_COLORS, MEAL_SLOTS } from '../utils/constants';
import { formatLongDate, formatNumber } from '../utils/format';
import { addDaysISO, isTodayISO, todayISO } from '../utils/date';

function MacroPie({ plan }) {
  // Share of calories from each macro (protein/carbs 4 kcal/g, fat 9 kcal/g).
  const data = [
    { name: 'Protein', value: Math.round((plan?.totalProtein || 0) * 4), color: MACRO_COLORS.protein },
    { name: 'Carbs', value: Math.round((plan?.totalCarbohydrates || 0) * 4), color: MACRO_COLORS.carbohydrates },
    { name: 'Fat', value: Math.round((plan?.totalFats || 0) * 9), color: MACRO_COLORS.fats },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return null;
  return (
    <div className="macro-pie">
      <div style={{ width: 140, height: 140 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={44} outerRadius={66} paddingAngle={3} stroke="none" isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v} kcal`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="pie-legend">
        {data.map((d) => (
          <li key={d.name}>
            <span className="macro-dot" style={{ background: d.color }} />
            {d.name}
            <strong className="num">{Math.round((d.value / total) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DietPlanner() {
  useDocumentTitle('Diet Planner');
  const { profile } = useUser();
  const { selectedDate, setDate, plan, status, error, mutating, reload, generatePlan, addMeal, updateEntry, removeEntry, clearPlan } = useDiet();
  const toast = useToast();
  const [pickerSlot, setPickerSlot] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const target = profile?.calorieTarget || 0;
  const planned = plan?.totalCalories || 0;
  const diff = planned - target;

  /** Runs a DietContext action and reports the result as a toast. */
  const act = async (action, success) => {
    try {
      await action();
      if (success) toast.success(success);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const handlePick = async (meal, servings) => {
    const ok = await act(() => addMeal(pickerSlot, meal._id, servings), `${meal.name} added`);
    if (ok) setPickerSlot(null);
  };

  const handleClear = async () => {
    await act(clearPlan, 'Plan cleared');
    setConfirmClear(false);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Diet Planner</h1>
          <p className="page-subtitle">{formatLongDate(selectedDate)}</p>
        </div>
        <div className="row wrap">
          <div className="date-nav">
            <button className="icon-btn" onClick={() => setDate(addDaysISO(selectedDate, -1))} aria-label="Previous day">
              <ChevronLeft />
            </button>
            <input type="date" className="input date-input" value={selectedDate} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Select date" />
            <button className="icon-btn" onClick={() => setDate(addDaysISO(selectedDate, 1))} aria-label="Next day">
              <ChevronRight />
            </button>
            {!isTodayISO(selectedDate) && (
              <button className="btn btn-ghost btn-sm" onClick={() => setDate(todayISO())}>
                Today
              </button>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => act(generatePlan, plan ? 'Plan regenerated' : 'Plan generated')} disabled={mutating || status === 'loading'}>
            {mutating ? <span className="spinner sm" /> : plan ? <RefreshCw /> : <Sparkles />}
            {plan ? 'Regenerate' : 'Generate plan'}
          </button>
        </div>
      </div>

      {status === 'error' && <ErrorMessage message={error} onRetry={reload} />}

      {status === 'loading' && !plan ? (
        <LoadingSpinner label="Loading plan…" />
      ) : (
        status !== 'error' && (
          <div className="grid grid-main-side">
            <div className="stack" style={{ gap: 16, minWidth: 0 }}>
              {!plan && (
                <div className="alert alert-info">
                  <Sparkles />
                  <span>
                    No plan for this day yet. <strong>Generate</strong> a personalised plan, or add meals to any section yourself.
                  </span>
                </div>
              )}
              {MEAL_SLOTS.map((s) => (
                <DietPlanCard
                  key={s.value}
                  slot={s.value}
                  label={s.label}
                  entries={plan?.[s.value] ?? []}
                  budget={target * s.share}
                  busy={mutating}
                  onAdd={setPickerSlot}
                  onToggle={(entry) => act(() => updateEntry(entry._id, { consumed: !entry.consumed }))}
                  onServings={(entry, servings) => act(() => updateEntry(entry._id, { servings }))}
                  onRemove={(entry) => act(() => removeEntry(entry._id), `${entry.meal.name} removed`)}
                />
              ))}
            </div>

            <aside className="stack planner-side" style={{ gap: 16 }}>
              <div className="card card-pad">
                <div className="card-title">Daily totals</div>
                <div className="card-subtitle">Target {formatNumber(target)} kcal</div>
                <div className="totals-kcal">
                  <strong className="num">{formatNumber(planned)}</strong>
                  <span>kcal planned</span>
                </div>
                <div className="bar" style={{ height: 10 }}>
                  <span style={{ width: `${target ? Math.min(100, (planned / target) * 100) : 0}%`, background: Math.abs(diff) > target * 0.1 ? 'var(--carbs)' : 'var(--primary)' }} />
                </div>
                <p className="small muted" style={{ marginTop: 8 }}>
                  {!plan
                    ? 'Nothing planned yet.'
                    : Math.abs(diff) <= target * 0.05
                      ? 'Right on target.'
                      : diff > 0
                        ? `${formatNumber(diff)} kcal above target`
                        : `${formatNumber(-diff)} kcal below target`}
                  {plan ? ` · ${formatNumber(plan.consumedCalories)} kcal eaten` : ''}
                </p>
                <div className="totals-grid">
                  <div>
                    <span>Protein</span>
                    <strong className="num">{formatNumber(plan?.totalProtein)} g</strong>
                  </div>
                  <div>
                    <span>Carbs</span>
                    <strong className="num">{formatNumber(plan?.totalCarbohydrates)} g</strong>
                  </div>
                  <div>
                    <span>Fat</span>
                    <strong className="num">{formatNumber(plan?.totalFats)} g</strong>
                  </div>
                </div>
              </div>

              {plan && planned > 0 && (
                <div className="card card-pad">
                  <div className="card-title" style={{ marginBottom: 12 }}>
                    Calories by macro
                  </div>
                  <MacroPie plan={plan} />
                  <hr className="divider" />
                  <MacroBreakdown
                    totals={{ protein: plan.totalProtein, carbohydrates: plan.totalCarbohydrates, fats: plan.totalFats }}
                    targets={profile?.macroTargets}
                  />
                </div>
              )}

              {plan && (
                <button className="btn btn-ghost" onClick={() => setConfirmClear(true)} disabled={mutating} style={{ color: 'var(--danger)' }}>
                  <Trash2 /> Clear this day’s plan
                </button>
              )}
              <Disclaimer />
            </aside>
          </div>
        )
      )}

      <MealPickerModal open={Boolean(pickerSlot)} slot={pickerSlot || 'breakfast'} busy={mutating} onClose={() => setPickerSlot(null)} onPick={handlePick} />
      <ConfirmDialog
        open={confirmClear}
        title="Clear this plan?"
        message="All meals planned for this day will be removed. This cannot be undone."
        confirmLabel="Clear plan"
        loading={mutating}
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
