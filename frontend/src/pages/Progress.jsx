import { useState } from 'react';
import { LineChart as LineIcon, Pencil, Plus, Scale, Target, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import ProgressChart from '../components/ProgressChart';
import DashboardCard from '../components/DashboardCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useFetch } from '../hooks/useFetch';
import { useUser } from '../hooks/useUser';
import { useToast } from '../hooks/useToast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { progressService } from '../services/progressService';
import { dietService } from '../services/dietService';
import { formatDate, formatNumber } from '../utils/format';
import { todayISO } from '../utils/date';
import { fieldErrorsFrom } from '../utils/validation';

const RANGES = [
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 0, label: 'All' },
];

function ProgressForm({ entry, onClose, onSaved }) {
  const { setProfile } = useUser();
  const toast = useToast();
  const [form, setForm] = useState({
    date: entry?.date || todayISO(),
    weight: entry?.weight ?? '',
    caloriesConsumed: entry?.caloriesConsumed ?? '',
    notes: entry?.notes ?? '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Pull the "eaten" total from that day's diet plan.
  const prefillCalories = async () => {
    setPrefilling(true);
    try {
      const plan = await dietService.getByDate(form.date);
      if (plan) setForm((f) => ({ ...f, caloriesConsumed: plan.consumedCalories }));
      else toast.info('No diet plan found for this date');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPrefilling(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.date) found.date = 'Pick a date';
    if (form.weight === '' || form.weight < 30 || form.weight > 300) found.weight = 'Weight must be 30–300 kg';
    if (form.caloriesConsumed !== '' && (form.caloriesConsumed < 0 || form.caloriesConsumed > 10000)) found.caloriesConsumed = 'Enter 0–10000';
    setErrors(found);
    if (Object.keys(found).length) return;

    const payload = {
      weight: Number(form.weight),
      caloriesConsumed: form.caloriesConsumed === '' ? 0 : Math.round(Number(form.caloriesConsumed)),
      notes: form.notes.trim(),
    };
    setSaving(true);
    try {
      const result = entry ? await progressService.update(entry._id, payload) : await progressService.create({ ...payload, date: form.date });
      setProfile(result.profile); // weight change → recalculated BMI & targets
      toast.success(entry ? 'Entry updated' : 'Progress logged');
      onSaved();
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={entry ? 'Edit check-in' : 'Log progress'}
      subtitle="Your latest weigh-in also updates your profile weight and calorie target."
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="progress-form" disabled={saving}>
            {saving && <span className="spinner sm" />}
            Save
          </button>
        </>
      }
    >
      <form id="progress-form" className="form-grid" onSubmit={submit} noValidate>
        <FormField label="Date" error={errors.date} hint={entry ? 'Date can’t be changed — delete and re-log instead.' : undefined}>
          {(p) => <input {...p} type="date" className="input" max={todayISO()} value={form.date} onChange={set('date')} disabled={Boolean(entry)} />}
        </FormField>
        <FormField label="Weight" error={errors.weight}>
          {(p) => (
            <div className="input-wrap">
              <input {...p} type="number" step="0.1" inputMode="decimal" className={`input ${errors.weight ? 'invalid' : ''}`} value={form.weight} onChange={set('weight')} placeholder="62.4" />
              <span className="input-suffix">kg</span>
            </div>
          )}
        </FormField>
        <FormField label="Calories consumed" error={errors.caloriesConsumed} className="full">
          {(p) => (
            <div className="row">
              <div className="input-wrap grow">
                <input {...p} type="number" inputMode="numeric" className="input" value={form.caloriesConsumed} onChange={set('caloriesConsumed')} placeholder="1650" />
                <span className="input-suffix">kcal</span>
              </div>
              <button type="button" className="btn btn-outline-accent" onClick={prefillCalories} disabled={prefilling}>
                {prefilling && <span className="spinner sm" />}
                Use plan total
              </button>
            </div>
          )}
        </FormField>
        <FormField label="Notes" className="full">
          {(p) => <textarea {...p} className="textarea" maxLength={500} value={form.notes} onChange={set('notes')} placeholder="How did the day go? (optional)" />}
        </FormField>
      </form>
    </Modal>
  );
}

export default function Progress() {
  useDocumentTitle('Progress');
  const { profile, setProfile } = useUser();
  const toast = useToast();
  const [range, setRange] = useState(90);
  const [editing, setEditing] = useState(null); // null | 'new' | entry
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const { data: entries, loading, error, refetch } = useFetch(() => progressService.list(), []);

  const all = entries ?? [];
  const cutoff = range ? Date.now() - range * 86400000 : 0;
  const visible = all.filter((e) => new Date(e.date).getTime() >= cutoff);
  const first = all[0];
  const latest = all[all.length - 1];
  const change = first && latest ? Math.round((latest.weight - first.weight) * 10) / 10 : 0;
  const currentWeight = latest?.weight ?? profile?.weight;
  const toTarget = profile?.targetWeight && currentWeight ? Math.round((currentWeight - profile.targetWeight) * 10) / 10 : null;

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      const result = await progressService.remove(deleting._id);
      setProfile(result.profile);
      toast.success('Entry deleted');
      setDeleting(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress</h1>
          <p className="page-subtitle">Log regular weigh-ins to see your trend — small, steady changes add up.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Plus /> Log progress
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {loading && !entries ? (
        <LoadingSpinner label="Loading progress…" />
      ) : (
        <div className="stack" style={{ gap: 20 }}>
          <div className="grid grid-3">
            <DashboardCard label="Current weight" icon={Scale} tone="yellow" value={formatNumber(currentWeight, 1)} unit="kg" hint={latest ? `Last logged ${formatDate(latest.date)}` : 'From your profile'} />
            <DashboardCard
              label="Total change"
              icon={change <= 0 ? TrendingDown : TrendingUp}
              tone="purple"
              value={`${change > 0 ? '+' : ''}${formatNumber(change, 1)}`}
              unit="kg"
              hint={first ? `Since ${formatDate(first.date, { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No entries yet'}
            />
            <DashboardCard
              label="Target weight"
              icon={Target}
              tone="coral"
              value={profile?.targetWeight ? formatNumber(profile.targetWeight, 1) : '—'}
              unit={profile?.targetWeight ? 'kg' : ''}
              hint={toTarget == null ? 'Set a target on your profile' : toTarget === 0 ? 'Target reached 🎉' : `${formatNumber(Math.abs(toTarget), 1)} kg to go`}
            />
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Weight over time</div>
                <div className="card-subtitle">{visible.length} check-ins in view</div>
              </div>
              <div className="segmented">
                {RANGES.map((r) => (
                  <button key={r.value} className={range === r.value ? 'active' : ''} onClick={() => setRange(r.value)}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-body">
              {visible.length >= 1 ? (
                <ProgressChart entries={visible} targetWeight={profile?.targetWeight} />
              ) : (
                <EmptyState icon={LineIcon} title="No check-ins in this range" description="Log your weight to start building your progress chart." />
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">History</div>
            </div>
            {all.length === 0 ? (
              <EmptyState
                icon={Scale}
                title="No progress logged yet"
                description="Your first weigh-in becomes the starting point for your trend."
                action={
                  <button className="btn btn-primary" onClick={() => setEditing('new')}>
                    <Plus /> Log progress
                  </button>
                }
              />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Weight</th>
                      <th>Change</th>
                      <th>Calories</th>
                      <th>Notes</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...all].reverse().map((entry, i, arr) => {
                      const prev = arr[i + 1];
                      const delta = prev ? Math.round((entry.weight - prev.weight) * 10) / 10 : null;
                      return (
                        <tr key={entry._id}>
                          <td className="nowrap bold">{formatDate(entry.date, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="num nowrap">{formatNumber(entry.weight, 1)} kg</td>
                          <td className="num nowrap">
                            {delta == null ? <span className="muted">—</span> : <span className={`trend ${delta < 0 ? 'down' : delta > 0 ? 'up' : ''}`}>{delta > 0 ? '+' : ''}{delta} kg</span>}
                          </td>
                          <td className="num nowrap">{entry.caloriesConsumed ? `${formatNumber(entry.caloriesConsumed)} kcal` : <span className="muted">—</span>}</td>
                          <td className="muted notes-cell">{entry.notes || '—'}</td>
                          <td>
                            <div className="actions">
                              <button className="icon-btn" onClick={() => setEditing(entry)} aria-label="Edit entry">
                                <Pencil />
                              </button>
                              <button className="icon-btn danger" onClick={() => setDeleting(entry)} aria-label="Delete entry">
                                <Trash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <ProgressForm
          key={editing === 'new' ? 'new' : editing._id}
          entry={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refetch();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this check-in?"
        message={deleting ? `The entry for ${formatDate(deleting.date)} will be permanently removed.` : ''}
        loading={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
