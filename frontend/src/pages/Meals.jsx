import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, UtensilsCrossed } from 'lucide-react';
import MealCard from '../components/MealCard';
import MealForm from '../components/MealForm';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../hooks/useToast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { mealService } from '../services/mealService';
import { DIETARY_TYPES, MEAL_SLOTS, MEAL_SORTS } from '../utils/constants';

const PAGE_SIZE = 24;
const SCOPES = [
  { value: 'all', label: 'All meals' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'custom', label: 'My meals' },
];

export default function Meals() {
  useDocumentTitle('Meals');
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [dietaryType, setDietaryType] = useState('');
  const [sort, setSort] = useState('name');
  const [scope, setScope] = useState('all');
  const [compatible, setCompatible] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const [editing, setEditing] = useState(null); // null = closed, {} = new, meal = edit
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const params = useMemo(
    () => ({ search: debouncedSearch, category, dietaryType, sort, scope, compatible: compatible ? 'true' : '', page, limit: PAGE_SIZE }),
    [debouncedSearch, category, dietaryType, sort, scope, compatible, page]
  );
  const { data, loading, error, refetch } = useFetch(() => mealService.list(params), [params]);
  const meals = data?.meals ?? [];
  const pagination = data?.pagination;

  // Any filter change goes back to page 1.
  const setFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const canEdit = (meal) => isAdmin || (meal.isCustom && meal.createdBy === user._id);

  const handleSave = async (payload) => {
    if (editing?._id) {
      await mealService.update(editing._id, payload);
      toast.success('Meal updated');
    } else {
      await mealService.create(payload);
      toast.success(isAdmin ? 'Meal added to the catalog' : 'Custom meal created');
    }
    setEditing(null);
    refetch();
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await mealService.remove(deleting._id);
      toast.success(`${deleting.name} deleted`);
      setDeleting(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteBusy(false);
    }
  };

  const filtersActive = search || category || dietaryType || compatible || scope !== 'all';

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meals</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Manage the shared meal catalog and your own recipes.' : 'Browse balanced meals or add your own recipes.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          <Plus /> {isAdmin ? 'Add catalog meal' : 'Add custom meal'}
        </button>
      </div>

      <div className="card toolbar">
        <div className="input-wrap toolbar-search">
          <input className="input" placeholder="Search meals by name…" value={search} onChange={(e) => setFilter(setSearch)(e.target.value)} aria-label="Search meals" />
          <Search className="input-suffix" size={17} />
        </div>
        <select className="select" value={category} onChange={(e) => setFilter(setCategory)(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {MEAL_SLOTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select className="select" value={dietaryType} onChange={(e) => setFilter(setDietaryType)(e.target.value)} aria-label="Filter by dietary type">
          <option value="">All diets</option>
          {DIETARY_TYPES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <select className="select" value={sort} onChange={(e) => setFilter(setSort)(e.target.value)} aria-label="Sort meals">
          {MEAL_SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="row-between wrap" style={{ margin: '16px 0 18px' }}>
        <div className="segmented" role="tablist">
          {SCOPES.map((s) => (
            <button key={s.value} role="tab" aria-selected={scope === s.value} className={scope === s.value ? 'active' : ''} onClick={() => setFilter(setScope)(s.value)}>
              {s.label}
            </button>
          ))}
        </div>
        <label className="row small bold text-2">
          <input type="checkbox" checked={compatible} onChange={(e) => setFilter(setCompatible)(e.target.checked)} />
          Only meals that fit my diet & allergies
        </label>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {loading && !data ? (
        <LoadingSpinner label="Loading meals…" />
      ) : meals.length === 0 && !error ? (
        <div className="card">
          <EmptyState
            icon={UtensilsCrossed}
            title={filtersActive ? 'No meals match these filters' : 'No meals yet'}
            description={filtersActive ? 'Try a different search or clear some filters.' : 'Add your first meal to get started.'}
            action={
              <button className="btn btn-primary" onClick={() => setEditing({})}>
                <Plus /> Add a meal
              </button>
            }
          />
        </div>
      ) : (
        <>
          <p className="small muted" style={{ marginBottom: 12 }}>
            {pagination?.total} meal{pagination?.total === 1 ? '' : 's'}
            {loading && ' · updating…'}
          </p>
          <div className="cards-grid" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
            {meals.map((meal) => (
              <MealCard key={meal._id} meal={meal} canEdit={canEdit(meal)} onEdit={setEditing} onDelete={setDeleting} />
            ))}
          </div>
          {pagination?.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft /> Previous
              </button>
              <span className="small muted">
                Page {page} of {pagination.pages}
              </span>
              <button className="btn btn-outline btn-sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {editing && <MealForm key={editing._id || 'new'} open meal={editing._id ? editing : null} isAdmin={isAdmin} onClose={() => setEditing(null)} onSubmit={handleSave} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete meal?"
        message={`“${deleting?.name}” will be removed${deleting?.isCustom ? '' : ' from the catalog for all users'} and from any plans that include it.`}
        loading={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
