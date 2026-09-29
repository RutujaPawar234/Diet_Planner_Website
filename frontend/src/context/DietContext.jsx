import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import { dietService } from '../services/dietService';
import { todayISO } from '../utils/date';

/**
 * DietContext — the diet plan for the selected date and every action that
 * changes it. State transitions go through a reducer so loading, error and
 * data always stay consistent.
 */
export const DietContext = createContext(null);

const createInitialState = () => ({
  selectedDate: todayISO(),
  plan: null,
  status: 'idle', // idle | loading | ready | error
  error: null,
  mutating: false, // true while a create/update/delete request is in flight
});

function dietReducer(state, action) {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.date };
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { ...state, status: 'ready', plan: action.plan };
    case 'LOAD_FAILURE':
      return { ...state, status: 'error', error: action.error };
    case 'MUTATE_START':
      return { ...state, mutating: true };
    case 'MUTATE_SUCCESS':
      return { ...state, mutating: false, plan: action.plan };
    case 'MUTATE_END':
      return { ...state, mutating: false };
    default:
      return state;
  }
}

export function DietProvider({ children }) {
  const [state, dispatch] = useReducer(dietReducer, undefined, createInitialState);
  const { selectedDate, plan } = state;

  const loadPlan = useCallback(async (date) => {
    dispatch({ type: 'LOAD_START' });
    try {
      dispatch({ type: 'LOAD_SUCCESS', plan: await dietService.getByDate(date) });
    } catch (err) {
      dispatch({ type: 'LOAD_FAILURE', error: err.message });
    }
  }, []);

  // Re-fetch whenever the selected date changes.
  useEffect(() => {
    loadPlan(selectedDate);
  }, [selectedDate, loadPlan]);

  /** Wraps a request: toggles `mutating`, stores the returned plan, rethrows errors for toasts. */
  const mutate = useCallback(async (request) => {
    dispatch({ type: 'MUTATE_START' });
    try {
      const updated = await request();
      dispatch({ type: 'MUTATE_SUCCESS', plan: updated ?? null });
      return updated;
    } catch (err) {
      dispatch({ type: 'MUTATE_END' });
      throw err;
    }
  }, []);

  const setDate = useCallback((date) => dispatch({ type: 'SET_DATE', date }), []);

  const generatePlan = useCallback(() => mutate(() => dietService.generate(selectedDate)), [mutate, selectedDate]);

  /** Adds a meal to a slot, creating the day's plan first if needed. */
  const addMeal = useCallback(
    (slot, mealId, servings = 1) =>
      mutate(() =>
        plan
          ? dietService.addEntry(plan._id, { slot, meal: mealId, servings })
          : dietService.create({ date: selectedDate, [slot]: [{ meal: mealId, servings }] })
      ),
    [mutate, plan, selectedDate]
  );

  const updateEntry = useCallback(
    (entryId, changes) => mutate(() => dietService.updateEntry(plan._id, entryId, changes)),
    [mutate, plan]
  );

  const removeEntry = useCallback(
    (entryId) => mutate(() => dietService.removeEntry(plan._id, entryId)),
    [mutate, plan]
  );

  const clearPlan = useCallback(
    () => mutate(() => dietService.remove(plan._id).then(() => null)),
    [mutate, plan]
  );

  const value = useMemo(
    () => ({
      ...state,
      setDate,
      reload: () => loadPlan(selectedDate),
      generatePlan,
      addMeal,
      updateEntry,
      removeEntry,
      clearPlan,
    }),
    [state, setDate, loadPlan, selectedDate, generatePlan, addMeal, updateEntry, removeEntry, clearPlan]
  );

  return <DietContext.Provider value={value}>{children}</DietContext.Provider>;
}
