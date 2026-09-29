import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Logo from '../components/Logo';
import BMIIndicator from '../components/BMIIndicator';
import Disclaimer from '../components/Disclaimer';
import { AllergyPicker, BodyFields, ChoiceGroup, EMPTY_PROFILE, formToPayload } from '../components/ProfileForm';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useToast } from '../hooks/useToast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { dietService } from '../services/dietService';
import { ACTIVITY_LEVELS, DIETARY_TYPES, GOALS } from '../utils/constants';
import { calculateBMI, estimateCalories } from '../utils/health';
import { fieldErrorsFrom, validateProfile } from '../utils/validation';
import { firstName, formatNumber } from '../utils/format';
import { todayISO } from '../utils/date';

const STEPS = [
  { title: 'About you', subtitle: 'We use these to estimate your energy needs.', fields: ['age', 'gender', 'height', 'weight', 'targetWeight'] },
  { title: 'Lifestyle & goal', subtitle: 'How active are you, and what are you aiming for?', fields: ['activityLevel', 'goal'] },
  { title: 'Food preferences', subtitle: 'Your plan will only include meals that fit.', fields: ['dietaryPreference'] },
];

export default function Onboarding() {
  useDocumentTitle('Set up your profile');
  const { user, hasProfile } = useAuth();
  const { saveProfile } = useUser();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Only validate the fields that belong to the current step.
  const stepErrors = (index) => {
    const all = validateProfile(form);
    return Object.fromEntries(Object.entries(all).filter(([k]) => STEPS[index].fields.includes(k)));
  };

  const next = () => {
    const found = stepErrors(step);
    setErrors(found);
    if (!Object.keys(found).length) setStep((s) => s + 1);
  };

  const finish = async () => {
    const found = validateProfile(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setStep(STEPS.findIndex((s) => s.fields.some((f) => found[f])));
      return;
    }
    setSaving(true);
    try {
      await saveProfile(formToPayload(form));
      // Give new users a ready-made plan for today; not critical if it fails.
      await dietService.generate(todayISO()).catch(() => null);
      toast.success('Your profile is ready — here is your first plan!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
      toast.error(err.message);
      // Reset only on failure: on success we are navigating away, and clearing
      // `saving` first would trigger the "already onboarded" redirect below.
      setSaving(false);
    }
  };

  // Users who already finished onboarding edit their details on the Profile page.
  if (hasProfile && !saving) return <Navigate to="/profile" replace />;

  const bmi = calculateBMI(Number(form.weight), Number(form.height));
  const estimate = estimateCalories({ ...form, weight: Number(form.weight), height: Number(form.height), age: Number(form.age) });
  const isLast = step === STEPS.length - 1;

  return (
    <div className="onboarding">
      <header className="onboarding-top container">
        <Logo />
        <span className="small muted">
          Step {step + 1} of {STEPS.length}
        </span>
      </header>

      <div className="container onboarding-grid">
        <div className="card onboarding-card fade-up" key={step}>
          <div className="stepper" aria-hidden="true">
            {STEPS.map((s, i) => (
              <div key={s.title} className={`stepper-item ${i < step ? 'done' : ''} ${i === step ? 'current' : ''}`}>
                <span>{i < step ? <Check size={14} /> : i + 1}</span>
                <em>{s.title}</em>
              </div>
            ))}
          </div>

          <div className="onboarding-head">
            {step === 0 && <p className="eyebrow-text">Welcome, {firstName(user?.name)} 👋</p>}
            <h1>{STEPS[step].title}</h1>
            <p className="muted">{STEPS[step].subtitle}</p>
          </div>

          {step === 0 && <BodyFields form={form} errors={errors} set={set} />}

          {step === 1 && (
            <div className="stack" style={{ gap: 26 }}>
              <div>
                <h3 className="form-section-title">Activity level</h3>
                <ChoiceGroup options={ACTIVITY_LEVELS} value={form.activityLevel} onChange={(v) => set('activityLevel', v)} error={errors.activityLevel} columns={2} />
              </div>
              <div>
                <h3 className="form-section-title">Your goal</h3>
                <ChoiceGroup options={GOALS} value={form.goal} onChange={(v) => set('goal', v)} error={errors.goal} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="stack" style={{ gap: 26 }}>
              <div>
                <h3 className="form-section-title">Dietary preference</h3>
                <ChoiceGroup options={DIETARY_TYPES} value={form.dietaryPreference} onChange={(v) => set('dietaryPreference', v)} error={errors.dietaryPreference} columns={2} />
              </div>
              <div>
                <h3 className="form-section-title">Allergies & foods to avoid</h3>
                <p className="small muted" style={{ marginBottom: 12 }}>
                  Optional. Meals containing these are left out of generated plans.
                </p>
                <AllergyPicker value={form.allergies} onChange={(v) => set('allergies', v)} />
              </div>
            </div>
          )}

          <div className="onboarding-actions">
            {step > 0 ? (
              <button className="btn btn-ghost" onClick={() => setStep((s) => s - 1)} disabled={saving}>
                <ArrowLeft /> Back
              </button>
            ) : (
              <span />
            )}
            {isLast ? (
              <button className="btn btn-primary btn-lg" onClick={finish} disabled={saving}>
                {saving && <span className="spinner sm" />}
                {saving ? 'Building your plan…' : 'Finish & see my plan'}
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={next}>
                Continue <ArrowRight />
              </button>
            )}
          </div>
        </div>

        <aside className="card card-pad onboarding-summary">
          <h3 className="card-title">Live estimate</h3>
          <p className="card-subtitle">Updates as you fill in your details.</p>
          <hr className="divider" />
          <span className="stat-label">Body Mass Index</span>
          <BMIIndicator bmi={bmi} />
          <hr className="divider" />
          <div className="summary-rows">
            <div>
              <span>BMR</span>
              <strong className="num">{estimate ? `${formatNumber(estimate.bmr)} kcal` : '—'}</strong>
            </div>
            <div>
              <span>Maintenance (TDEE)</span>
              <strong className="num">{estimate && form.activityLevel ? `${formatNumber(estimate.tdee)} kcal` : '—'}</strong>
            </div>
            <div className="highlight">
              <span>Daily target</span>
              <strong className="num">{estimate && form.activityLevel && form.goal ? `${formatNumber(estimate.target)} kcal` : '—'}</strong>
            </div>
          </div>
          <Disclaimer text="Estimates use the Mifflin-St Jeor equation and are for general planning only — not medical advice." />
        </aside>
      </div>
    </div>
  );
}
