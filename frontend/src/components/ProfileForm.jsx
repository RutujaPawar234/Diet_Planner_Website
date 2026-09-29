import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import FormField from './FormField';
import { ACTIVITY_LEVELS, ALLERGENS, DIETARY_TYPES, GENDERS, GOALS } from '../utils/constants';
import { fieldErrorsFrom, validateProfile } from '../utils/validation';

export const EMPTY_PROFILE = {
  age: '',
  gender: '',
  height: '',
  weight: '',
  targetWeight: '',
  activityLevel: '',
  goal: '',
  dietaryPreference: '',
  allergies: [],
};

export const profileToForm = (profile) =>
  profile
    ? {
        ...EMPTY_PROFILE,
        ...Object.fromEntries(Object.keys(EMPTY_PROFILE).map((k) => [k, profile[k] ?? EMPTY_PROFILE[k]])),
      }
    : EMPTY_PROFILE;

/** Converts form strings into the numeric payload expected by PUT /api/profile. */
export const formToPayload = (f) => ({
  age: Number(f.age),
  gender: f.gender,
  height: Number(f.height),
  weight: Number(f.weight),
  targetWeight: f.targetWeight ? Number(f.targetWeight) : undefined,
  activityLevel: f.activityLevel,
  goal: f.goal,
  dietaryPreference: f.dietaryPreference,
  allergies: f.allergies,
});

/** Card-style single choice (used for activity, goal and diet). */
export function ChoiceGroup({ options, value, onChange, error, columns }) {
  return (
    <>
      <div className="choice-grid" role="radiogroup" style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}>
        {options.map((o) => (
          <button
            type="button"
            key={o.value}
            role="radio"
            aria-checked={value === o.value}
            className={`choice ${value === o.value ? 'active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.icon && <o.icon className="choice-icon" aria-hidden="true" />}
            <span className="choice-title">{o.label}</span>
            {o.description && <span className="choice-desc">{o.description}</span>}
          </button>
        ))}
      </div>
      {error && <span className="field-error">{error}</span>}
    </>
  );
}

const numberInput = (form, errors, set, key, label, suffix, props = {}) => (
  <FormField label={label} error={errors[key]} hint={props.hint}>
    {(p) => (
      <div className="input-wrap">
        <input
          {...p}
          className={`input ${errors[key] ? 'invalid' : ''}`}
          type="number"
          inputMode="decimal"
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          step={props.step ?? 'any'}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
    )}
  </FormField>
);

export function BodyFields({ form, errors, set }) {
  return (
    <div className="form-grid">
      {numberInput(form, errors, set, 'age', 'Age', 'years', { placeholder: '25', min: 13, max: 100, step: 1 })}
      <FormField label="Gender" error={errors.gender}>
        {(p) => (
          <select {...p} className={`select ${errors.gender ? 'invalid' : ''}`} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
            <option value="">Select…</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        )}
      </FormField>
      {numberInput(form, errors, set, 'height', 'Height', 'cm', { placeholder: '165', min: 100, max: 250 })}
      {numberInput(form, errors, set, 'weight', 'Current weight', 'kg', { placeholder: '62', min: 30, max: 300 })}
      {numberInput(form, errors, set, 'targetWeight', 'Target weight (optional)', 'kg', { placeholder: '58', min: 30, max: 300, hint: 'Shown as a line on your progress chart' })}
    </div>
  );
}

export function AllergyPicker({ value, onChange }) {
  const [custom, setCustom] = useState('');
  const toggle = (a) => onChange(value.includes(a) ? value.filter((x) => x !== a) : [...value, a]);
  const addCustom = () => {
    const a = custom.trim().toLowerCase();
    if (a && !value.includes(a)) onChange([...value, a]);
    setCustom('');
  };
  const extras = value.filter((a) => !ALLERGENS.includes(a));

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="chips">
        {ALLERGENS.map((a) => (
          <button type="button" key={a} className={`chip ${value.includes(a) ? 'active' : ''}`} onClick={() => toggle(a)} aria-pressed={value.includes(a)}>
            {a}
          </button>
        ))}
        {extras.map((a) => (
          <button type="button" key={a} className="chip active" onClick={() => toggle(a)} aria-label={`Remove ${a}`}>
            {a} <X />
          </button>
        ))}
      </div>
      <div className="row" style={{ maxWidth: 420 }}>
        <input
          className="input"
          placeholder="Other allergy or ingredient to avoid"
          value={custom}
          maxLength={30}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
          aria-label="Add another allergy"
        />
        <button type="button" className="btn btn-outline" onClick={addCustom} disabled={!custom.trim()}>
          <Plus /> Add
        </button>
      </div>
    </div>
  );
}

/** Full profile editor used on the Profile page. */
export default function ProfileForm({ initial, onSubmit, submitLabel = 'Save changes' }) {
  const [form, setForm] = useState(() => profileToForm(initial));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateProfile(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSubmit(formToPayload(form));
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="stack" style={{ gap: 28 }}>
      <section>
        <h3 className="form-section-title">Body measurements</h3>
        <BodyFields form={form} errors={errors} set={set} />
      </section>
      <section>
        <h3 className="form-section-title">Activity level</h3>
        <ChoiceGroup options={ACTIVITY_LEVELS} value={form.activityLevel} onChange={(v) => set('activityLevel', v)} error={errors.activityLevel} />
      </section>
      <section>
        <h3 className="form-section-title">Goal</h3>
        <ChoiceGroup options={GOALS} value={form.goal} onChange={(v) => set('goal', v)} error={errors.goal} />
      </section>
      <section>
        <h3 className="form-section-title">Dietary preference</h3>
        <ChoiceGroup options={DIETARY_TYPES} value={form.dietaryPreference} onChange={(v) => set('dietaryPreference', v)} error={errors.dietaryPreference} />
      </section>
      <section>
        <h3 className="form-section-title">Allergies & foods to avoid</h3>
        <AllergyPicker value={form.allergies} onChange={(v) => set('allergies', v)} />
      </section>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          {saving && <span className="spinner sm" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
