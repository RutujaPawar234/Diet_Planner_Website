import { useState } from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import ProfileForm from '../components/ProfileForm';
import BMIIndicator from '../components/BMIIndicator';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Disclaimer from '../components/Disclaimer';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useToast } from '../hooks/useToast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { authService } from '../services/authService';
import { ACTIVITY_LEVELS, GOALS, labelOf } from '../utils/constants';
import { formatDate, formatNumber, initials } from '../utils/format';

function AccountCard() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Name must be at least 2 characters');
    setSaving(true);
    setError('');
    try {
      updateUser(await authService.updateAccount({ name: name.trim() }));
      toast.success('Name updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card card-pad">
      <div className="row" style={{ gap: 16 }}>
        <div className="avatar lg">{initials(user.name)}</div>
        <div className="grow">
          <div className="card-title">{user.name}</div>
          <div className="small muted row" style={{ gap: 6 }}>
            <Mail size={14} /> {user.email}
          </div>
          <div className="row" style={{ gap: 6, marginTop: 8 }}>
            <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-coral'}`}>
              <ShieldCheck /> {user.role === 'admin' ? 'Admin' : 'Member'}
            </span>
            {user.createdAt && <span className="tiny muted">since {formatDate(user.createdAt.slice(0, 10), { month: 'short', year: 'numeric' })}</span>}
          </div>
        </div>
      </div>
      <hr className="divider" />
      <form onSubmit={save} className="row" style={{ alignItems: 'flex-end' }} noValidate>
        <FormField label="Display name" error={error} className="grow">
          {(p) => <input {...p} className={`input ${error ? 'invalid' : ''}`} value={name} onChange={(e) => setName(e.target.value)} />}
        </FormField>
        <button className="btn btn-outline" disabled={saving || name.trim() === user.name} style={{ marginBottom: error ? 24 : 0 }}>
          {saving && <span className="spinner sm" />}
          Save
        </button>
      </form>
    </div>
  );
}

export default function Profile() {
  useDocumentTitle('Profile');
  const { profile, loading, error, refreshProfile, saveProfile } = useUser();
  const toast = useToast();
  const [version, setVersion] = useState(0);

  if (loading && !profile) return <LoadingSpinner label="Loading profile…" />;
  if (error && !profile) return <ErrorMessage message={error} onRetry={refreshProfile} />;
  if (!profile) return null;

  const handleSave = async (payload) => {
    const saved = await saveProfile(payload);
    toast.success(`Profile saved · new daily target ${formatNumber(saved.calorieTarget)} kcal`);
    setVersion((v) => v + 1); // re-seed the form with the saved values
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Keep your details current — your calorie target and meal plans update automatically.</p>
        </div>
      </div>

      <div className="grid grid-main-side">
        <div className="card card-pad" style={{ minWidth: 0 }}>
          <ProfileForm key={version} initial={profile} onSubmit={handleSave} />
        </div>

        <aside className="stack" style={{ gap: 18 }}>
          <AccountCard />
          <div className="card card-pad">
            <div className="card-title">Your metrics</div>
            <div className="card-subtitle" style={{ marginBottom: 12 }}>
              Calculated by the server from your saved profile
            </div>
            <BMIIndicator bmi={profile.bmi} />
            <hr className="divider" />
            <div className="summary-rows">
              <div>
                <span>BMR</span>
                <strong className="num">{formatNumber(profile.bmr)} kcal</strong>
              </div>
              <div>
                <span>TDEE · {labelOf(ACTIVITY_LEVELS, profile.activityLevel)}</span>
                <strong className="num">{formatNumber(profile.tdee)} kcal</strong>
              </div>
              <div className="highlight">
                <span>Target · {labelOf(GOALS, profile.goal)}</span>
                <strong className="num">{formatNumber(profile.calorieTarget)} kcal</strong>
              </div>
              <div>
                <span>Protein / Carbs / Fat</span>
                <strong className="num">
                  {profile.macroTargets.protein} / {profile.macroTargets.carbohydrates} / {profile.macroTargets.fats} g
                </strong>
              </div>
            </div>
          </div>
          <Disclaimer />
        </aside>
      </div>
    </>
  );
}
