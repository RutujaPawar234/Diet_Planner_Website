import { Pencil, Plus, Trash2 } from 'lucide-react';
import { DIETARY_TYPES, MEAL_SLOTS, labelOf } from '../utils/constants';
import { formatNumber } from '../utils/format';

export function DietBadge({ type }) {
  return (
    <span className="badge">
      <span className={`diet-dot diet-${type}`} aria-hidden="true" />
      {labelOf(DIETARY_TYPES, type)}
    </span>
  );
}

export function MacroGrid({ meal, servings = 1 }) {
  const v = (n) => formatNumber(n * servings);
  return (
    <div className="macros">
      <div className="macro kcal">
        <strong>{v(meal.calories)}</strong>
        <span>kcal</span>
      </div>
      <div className="macro protein">
        <strong>{v(meal.protein)}g</strong>
        <span>Protein</span>
      </div>
      <div className="macro carbs">
        <strong>{v(meal.carbohydrates)}g</strong>
        <span>Carbs</span>
      </div>
      <div className="macro fat">
        <strong>{v(meal.fats)}g</strong>
        <span>Fat</span>
      </div>
    </div>
  );
}

/** Meal catalog card with optional edit / delete / add-to-plan actions. */
export default function MealCard({ meal, canEdit, onEdit, onDelete, onAdd }) {
  return (
    <article className={`card meal-card meal-card-${meal.category} fade-up`}>
      <div className="meal-card-head">
        <div className="grow">
          <h3>{meal.name}</h3>
          <p className="meal-desc">{meal.description || meal.servingSize}</p>
        </div>
      </div>
      <div className="meal-meta">
        <span className={`badge badge-${meal.category}`}>{labelOf(MEAL_SLOTS, meal.category)}</span>
        <DietBadge type={meal.dietaryType} />
        {meal.isCustom && <span className="badge badge-purple">My meal</span>}
      </div>
      <MacroGrid meal={meal} />
      {meal.ingredients?.length > 0 && (
        <p className="ingredients">
          <span className="bold">Ingredients: </span>
          {meal.ingredients.join(', ')}
        </p>
      )}
      {meal.allergens?.length > 0 && (
        <p className="tiny muted">Contains: {meal.allergens.join(', ')}</p>
      )}
      <div className="meal-card-foot">
        <span className="tiny muted">{meal.servingSize}</span>
        <div className="row" style={{ gap: 4 }}>
          {canEdit && (
            <>
              <button className="icon-btn" onClick={() => onEdit(meal)} aria-label={`Edit ${meal.name}`}>
                <Pencil />
              </button>
              <button className="icon-btn danger" onClick={() => onDelete(meal)} aria-label={`Delete ${meal.name}`}>
                <Trash2 />
              </button>
            </>
          )}
          {onAdd && (
            <button className="btn btn-soft btn-sm" onClick={() => onAdd(meal)}>
              <Plus /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
