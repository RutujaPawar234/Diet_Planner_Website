import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';
import { DietBadge } from './MealCard';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { mealService } from '../services/mealService';
import { MEAL_SLOTS, labelOf } from '../utils/constants';
import { formatNumber } from '../utils/format';

/** Lets the user search compatible meals and add one to a plan slot. */
export default function MealPickerModal({ open, slot, onClose, onPick, busy }) {
  const [search, setSearch] = useState('');
  const [onlySlot, setOnlySlot] = useState(true);
  const [servings, setServings] = useState(1);
  const debounced = useDebounce(search);

  const { data, loading, error, refetch } = useFetch(
    () =>
      open
        ? mealService.list({ search: debounced, category: onlySlot ? slot : '', compatible: 'true', sort: 'name', limit: 60 })
        : Promise.resolve(null),
    [open, debounced, onlySlot, slot]
  );
  const meals = data?.meals ?? [];

  return (
    <Modal open={open} onClose={onClose} size="lg" title={`Add to ${labelOf(MEAL_SLOTS, slot)}`} subtitle="Showing meals that match your dietary preference and allergies.">
      <div className="picker-controls">
        <div className="input-wrap grow">
          <input className="input" placeholder="Search meals…" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus aria-label="Search meals" />
          <Search className="input-suffix" size={17} />
        </div>
        <label className="row small bold text-2 nowrap">
          <input type="checkbox" checked={onlySlot} onChange={(e) => setOnlySlot(e.target.checked)} />
          Only {labelOf(MEAL_SLOTS, slot).toLowerCase()}
        </label>
        <label className="row small bold text-2 nowrap">
          Servings
          <select className="select" style={{ width: 90, height: 38 }} value={servings} onChange={(e) => setServings(Number(e.target.value))}>
            {[0.5, 1, 1.5, 2, 3].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}
      {loading && !meals.length ? (
        <LoadingSpinner label="Finding meals…" />
      ) : meals.length === 0 && !error ? (
        <EmptyState title="No meals found" description="Try another search, or add your own meal from the Meals page." />
      ) : (
        <ul className="picker-list">
          {meals.map((meal) => (
            <li key={meal._id} className="picker-item">
              <div className="grow">
                <div className="bold">{meal.name}</div>
                <div className="row wrap small muted" style={{ gap: 8, marginTop: 4 }}>
                  <DietBadge type={meal.dietaryType} />
                  <span>{labelOf(MEAL_SLOTS, meal.category)}</span>
                  <span>·</span>
                  <span className="num">P {meal.protein}g · C {meal.carbohydrates}g · F {meal.fats}g</span>
                </div>
              </div>
              <div className="picker-kcal num">{formatNumber(meal.calories * servings)} kcal</div>
              <button className="btn btn-soft btn-sm" disabled={busy} onClick={() => onPick(meal, servings)}>
                <Plus /> Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
