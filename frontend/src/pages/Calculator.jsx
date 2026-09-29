import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import BMIIndicator from '../components/BMIIndicator';
import Disclaimer from '../components/Disclaimer';
import { BodyFields, ChoiceGroup } from '../components/ProfileForm';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ACTIVITY_LEVELS, GOALS } from '../utils/constants';
import { ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS, bmiInfo, calculateBMI, estimateCalories } from '../utils/health';
import { formatNumber } from '../utils/format';

/**
 * Standalone BMI & calorie calculator. Public at /calculator, and inside the
 * app at /tools/calculator (pre-filled from the saved profile).
 */
export default function Calculator({ embedded = false }) {
  useDocumentTitle('BMI & Calorie Calculator');
  const { isAuthenticated } = useAuth();
  const { profile } = useUser();

  const [form, setForm] = useState(() => ({
    age: profile?.age ?? '',
    gender: profile?.gender ?? 'female',
    height: profile?.height ?? '',
    weight: profile?.weight ?? '',
    activityLevel: profile?.activityLevel ?? 'light',
    goal: profile?.goal ?? 'maintenance',
  }));
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const nums = { ...form, age: Number(form.age), height: Number(form.height), weight: Number(form.weight) };
  const validBody = nums.height >= 100 && nums.height <= 250 && nums.weight >= 30 && nums.weight <= 300;
  const bmi = validBody ? calculateBMI(nums.weight, nums.height) : null;
  const est = validBody && nums.age >= 13 && nums.age <= 100 ? estimateCalories(nums) : null;

  const content = (
    <div className="grid grid-main-side">
      <div className="card card-pad stack" style={{ gap: 26, minWidth: 0 }}>
        <div>
          <h3 className="form-section-title">Your details</h3>
          <BodyFields form={{ ...form, targetWeight: '' }} errors={{}} set={set} />
        </div>
        <div>
          <h3 className="form-section-title">Activity level</h3>
          <ChoiceGroup options={ACTIVITY_LEVELS} value={form.activityLevel} onChange={(v) => set('activityLevel', v)} columns={2} />
        </div>
        <div>
          <h3 className="form-section-title">Goal</h3>
          <ChoiceGroup options={GOALS} value={form.goal} onChange={(v) => set('goal', v)} />
        </div>
      </div>

      <aside className="stack" style={{ gap: 18 }}>
        <div className="card card-pad">
          <div className="card-title">Body Mass Index</div>
          <div className="card-subtitle" style={{ marginBottom: 12 }}>
            weight (kg) ÷ height (m)²
          </div>
          <BMIIndicator bmi={bmi} />
          {bmi && (
            <p className="small muted" style={{ marginTop: 14 }}>
              A BMI of {bmi} falls in the <strong>{bmiInfo(bmi).label.toLowerCase()}</strong> range. BMI is a general screening
              metric — it does not account for muscle mass, age or body composition, and is not a diagnosis.
            </p>
          )}
        </div>
        <div className="card card-pad">
          <div className="card-title">Daily energy estimate</div>
          <div className="card-subtitle" style={{ marginBottom: 6 }}>
            Mifflin-St Jeor equation
          </div>
          <div className="summary-rows">
            <div>
              <span>BMR (at rest)</span>
              <strong className="num">{est ? `${formatNumber(est.bmr)} kcal` : '—'}</strong>
            </div>
            <div>
              <span>× activity {ACTIVITY_MULTIPLIERS[form.activityLevel]}</span>
              <strong className="num">{est ? `${formatNumber(est.tdee)} kcal` : '—'}</strong>
            </div>
            <div>
              <span>Goal adjustment</span>
              <strong className="num">
                {GOAL_ADJUSTMENTS[form.goal] > 0 ? '+' : ''}
                {GOAL_ADJUSTMENTS[form.goal]} kcal
              </strong>
            </div>
            <div className="highlight">
              <span>Suggested daily target</span>
              <strong className="num">{est ? `${formatNumber(est.target)} kcal` : '—'}</strong>
            </div>
          </div>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
              Get a meal plan for this target <ArrowRight />
            </Link>
          )}
        </div>
        <Disclaimer />
      </aside>
    </div>
  );

  if (embedded) {
    return (
      <>
        <div className="page-header">
          <div>
            <h1 className="page-title">BMI & Calorie Calculator</h1>
            <p className="page-subtitle">Try “what if” scenarios — this does not change your saved profile.</p>
          </div>
        </div>
        {content}
      </>
    );
  }

  return (
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="container">
        <div className="section-head" style={{ textAlign: 'left', margin: '0 0 28px' }}>
          <span className="eyebrow">Free tool</span>
          <h2>BMI & Calorie Calculator</h2>
          <p style={{ margin: 0 }}>Estimate your BMI and daily calorie needs in seconds.</p>
        </div>
        {content}
      </div>
    </section>
  );
}
