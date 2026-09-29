import { useState } from 'react';
import FormField from './FormField';
import Modal from './Modal';
import { ALLERGENS, DIETARY_TYPES, MEAL_SLOTS } from '../utils/constants';
import { fieldErrorsFrom } from '../utils/validation';

const EMPTY = {
  name: '',
  description: '',
  category: 'breakfast',
  dietaryType: 'vegetarian',
  calories: '',
  protein: '',
  carbohydrates: '',
  fats: '',
  servingSize: '1 serving',
  ingredients: '',
  allergens: [],
};

const toForm = (meal) =>
  meal ? { ...EMPTY, ...meal, ingredients: (meal.ingredients || []).join(', '), allergens: meal.allergens || [] } : EMPTY;

function validate(f) {
  const errors = {};
  if (f.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  const check = (key, max) => {
    if (f[key] === '' || Number(f[key]) < 0 || Number(f[key]) > max) errors[key] = `Enter 0–${max}`;
  };
  check('calories', 3000);
  check('protein', 300);
  check('carbohydrates', 400);
  check('fats', 300);
  return errors;
}

/** Add / edit meal dialog. `onSubmit(payload)` should return a promise. */
export default function MealForm({ open, meal, onClose, onSubmit, isAdmin }) {
  const [form, setForm] = useState(() => toForm(meal));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleAllergen = (a) =>
    setForm((f) => ({
      ...f,
      allergens: f.allergens.includes(a) ? f.allergens.filter((x) => x !== a) : [...f.allergens, a],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setServerError('');
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        dietaryType: form.dietaryType,
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbohydrates: Number(form.carbohydrates),
        fats: Number(form.fats),
        servingSize: form.servingSize.trim() || '1 serving',
        ingredients: form.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
        allergens: form.allergens,
      });
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const numberField = (key, label, suffix) => (
    <FormField label={label} error={errors[key]}>
      {(p) => (
        <div className="input-wrap">
          <input {...p} className={`input ${errors[key] ? 'invalid' : ''}`} type="number" min="0" step="0.1" inputMode="decimal" value={form[key]} onChange={set(key)} />
          <span className="input-suffix">{suffix}</span>
        </div>
      )}
    </FormField>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={meal ? 'Edit meal' : 'Add a meal'}
      subtitle={isAdmin ? 'Catalog meals are visible to every user.' : 'Custom meals are private to your account.'}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="meal-form" className="btn btn-primary" disabled={saving}>
            {saving && <span className="spinner sm" />}
            {meal ? 'Save changes' : 'Add meal'}
          </button>
        </>
      }
    >
      <form id="meal-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        {serverError && <div className="alert alert-error full">{serverError}</div>}
        <FormField label="Meal name" error={errors.name} className="full">
          {(p) => <input {...p} className={`input ${errors.name ? 'invalid' : ''}`} value={form.name} onChange={set('name')} placeholder="e.g. Paneer Tikka Bowl" />}
        </FormField>
        <FormField label="Category">
          {(p) => (
            <select {...p} className="select" value={form.category} onChange={set('category')}>
              {MEAL_SLOTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          )}
        </FormField>
        <FormField label="Dietary type">
          {(p) => (
            <select {...p} className="select" value={form.dietaryType} onChange={set('dietaryType')}>
              {DIETARY_TYPES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          )}
        </FormField>
        {numberField('calories', 'Calories', 'kcal')}
        {numberField('protein', 'Protein', 'g')}
        {numberField('carbohydrates', 'Carbohydrates', 'g')}
        {numberField('fats', 'Fat', 'g')}
        <FormField label="Serving size">
          {(p) => <input {...p} className="input" value={form.servingSize} onChange={set('servingSize')} placeholder="1 bowl (250 g)" />}
        </FormField>
        <FormField label="Ingredients" hint="Separate with commas">
          {(p) => <input {...p} className="input" value={form.ingredients} onChange={set('ingredients')} placeholder="paneer, peppers, rice" />}
        </FormField>
        <FormField label="Description" className="full">
          {(p) => <textarea {...p} className="textarea" rows={2} maxLength={300} value={form.description} onChange={set('description')} placeholder="Short description (optional)" />}
        </FormField>
        <div className="field full">
          <span className="label">Contains allergens</span>
          <div className="chips">
            {ALLERGENS.map((a) => (
              <button type="button" key={a} className={`chip ${form.allergens.includes(a) ? 'active' : ''}`} onClick={() => toggleAllergen(a)} aria-pressed={form.allergens.includes(a)}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
