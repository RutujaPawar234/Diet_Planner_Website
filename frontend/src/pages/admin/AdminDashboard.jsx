import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarDays, ClipboardList, Search, Trash2, TrendingUp, UserRound, Users, UtensilsCrossed } from 'lucide-react';
import DashboardCard from '../../components/DashboardCard';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../hooks/useToast';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/adminService';
import { DIETARY_TYPES, GOALS, MEAL_SLOTS, labelOf } from '../../utils/constants';
import { formatDate, formatNumber, initials } from '../../utils/format';
import { CHART, SLOT_COLORS } from '../../utils/theme';

function UsersTable() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { data: users, setData, loading, error, refetch } = useFetch(() => adminService.users(debounced), [debounced]);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const changeRole = async (u, role) => {
    setBusyId(u._id);
    try {
      const updated = await adminService.updateRole(u._id, role);
      setData((list) => list.map((x) => (x._id === u._id ? { ...x, role: updated.role } : x)));
      toast.success(`${u.name} is now ${role === 'admin' ? 'an admin' : 'a user'}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    setBusyId(deleting._id);
    try {
      await adminService.deleteUser(deleting._id);
      setData((list) => list.filter((x) => x._id !== deleting._id));
      toast.success('User deleted');
      setDeleting(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header wrap">
        <div>
          <div className="card-title">Users</div>
          <div className="card-subtitle">{users ? `${users.length} shown` : 'Loading…'}</div>
        </div>
        <div className="input-wrap" style={{ width: 280, maxWidth: '100%' }}>
          <input className="input" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
          <Search className="input-suffix" size={17} />
        </div>
      </div>
      {error && (
        <div className="card-body">
          <ErrorMessage message={error} onRetry={refetch} />
        </div>
      )}
      {loading && !users ? (
        <LoadingSpinner label="Loading users…" />
      ) : users?.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try a different search." />
      ) : (
        users && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Goal</th>
                  <th>Diet</th>
                  <th>Target</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = u._id === me._id;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="row" style={{ gap: 10 }}>
                          <div className="avatar">{initials(u.name)}</div>
                          <div style={{ minWidth: 0 }}>
                            <div className="bold nowrap">
                              {u.name} {isMe && <span className="badge">You</span>}
                            </div>
                            <div className="tiny muted">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="nowrap">{u.profile ? labelOf(GOALS, u.profile.goal) : <span className="muted">Not onboarded</span>}</td>
                      <td className="nowrap">{u.profile ? labelOf(DIETARY_TYPES, u.profile.dietaryPreference) : '—'}</td>
                      <td className="num nowrap">{u.profile ? `${formatNumber(u.profile.calorieTarget)} kcal` : '—'}</td>
                      <td className="nowrap">{formatDate(u.createdAt.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <select className="select" style={{ height: 34, width: 110 }} value={u.role} disabled={isMe || busyId === u._id} onChange={(e) => changeRole(u, e.target.value)} aria-label={`Role for ${u.name}`}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="icon-btn danger" disabled={isMe} onClick={() => setDeleting(u)} aria-label={`Delete ${u.name}`} title={isMe ? 'You cannot delete yourself' : 'Delete user'}>
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
        )
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete user?"
        message={deleting ? `${deleting.name}'s account, profile, plans, progress and custom meals will be permanently deleted.` : ''}
        confirmLabel="Delete user"
        loading={busyId === deleting?._id}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

export default function AdminDashboard() {
  useDocumentTitle('Admin');
  const { data, loading, error, refetch } = useFetch(() => adminService.stats(), []);

  if (loading && !data) return <LoadingSpinner label="Loading statistics…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={refetch} />;

  const { totals, mealsByCategory, usersByDiet } = data;
  const categoryData = MEAL_SLOTS.map((s) => {
    const found = mealsByCategory.find((c) => c.category === s.value);
    return { name: s.label, slot: s.value, count: found?.count || 0, avgCalories: found?.avgCalories || 0 };
  });

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Application statistics, user management and the meal catalog.</p>
        </div>
        <Link to="/meals" className="btn btn-secondary">
          <UtensilsCrossed /> Manage meal catalog
        </Link>
      </div>

      <div className="grid grid-4">
        <DashboardCard label="Users" icon={Users} tone="coral" value={formatNumber(totals.users)} hint={`${totals.newUsers} new this week · ${totals.admins} admin${totals.admins === 1 ? '' : 's'}`} />
        <DashboardCard label="Catalog meals" icon={UtensilsCrossed} tone="yellow" value={formatNumber(totals.catalogMeals)} hint={`${totals.customMeals} custom meals by users`} />
        <DashboardCard label="Diet plans" icon={CalendarDays} tone="purple" value={formatNumber(totals.plans)} hint={`${totals.profiles} users onboarded`} />
        <DashboardCard label="Progress logs" icon={TrendingUp} tone="pink" value={formatNumber(totals.progressEntries)} hint="Weigh-ins recorded" />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Meals by category</div>
              <div className="card-subtitle">Number of meals · hover for average calories</div>
            </div>
            <ClipboardList size={18} className="muted" />
          </div>
          <div className="card-body" style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={categoryData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="name" tick={CHART.tick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={CHART.tick} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: CHART.cursor }} formatter={(v, n, p) => [`${v} meals · avg ${p.payload.avgCalories} kcal`, 'Meals']} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false}>
                  {categoryData.map((d) => (
                    <Cell key={d.slot} fill={SLOT_COLORS[d.slot]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Users by dietary preference</div>
              <div className="card-subtitle">Among onboarded users</div>
            </div>
            <UserRound size={18} className="muted" />
          </div>
          <div className="card-body stack" style={{ gap: 16 }}>
            {usersByDiet.length === 0 ? (
              <p className="muted small">No onboarded users yet.</p>
            ) : (
              DIETARY_TYPES.map((d) => {
                const count = usersByDiet.find((u) => u.dietaryPreference === d.value)?.count || 0;
                const pct = totals.profiles ? (count / totals.profiles) * 100 : 0;
                return (
                  <div className="macro-row" key={d.value}>
                    <div className="row-between">
                      <span className="bold">
                        <span className={`diet-dot diet-${d.value}`} style={{ display: 'inline-block', marginRight: 8 }} />
                        {d.label}
                      </span>
                      <span className="muted num">
                        {count} · {Math.round(pct)}%
                      </span>
                    </div>
                    <div className="bar">
                      <span className={`diet-${d.value}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <UsersTable />
    </div>
  );
}
