import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import FormField from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import ErrorMessage from '../components/ErrorMessage';
import { homePath } from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { validateLogin } from '../utils/validation';
import { firstName } from '../utils/format';

export default function Login() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateLogin(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      const { user, hasProfile } = await login({ email: form.email.trim(), password: form.password });
      toast.success(`Welcome back, ${firstName(user.name)}!`);
      const from = location.state?.from;
      navigate(hasProfile && from ? from : homePath(user, hasProfile), { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see today’s plan and your progress."
      footer={
        <>
          New to NutriPlan? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError && <ErrorMessage message={serverError} />}
        <FormField label="Email" error={errors.email}>
          {(p) => (
            <input {...p} type="email" autoComplete="email" className={`input ${errors.email ? 'invalid' : ''}`} placeholder="you@example.com" value={form.email} onChange={set('email')} />
          )}
        </FormField>
        <FormField label="Password" error={errors.password}>
          {(p) => <PasswordInput {...p} autoComplete="current-password" invalid={errors.password} placeholder="Your password" value={form.password} onChange={set('password')} />}
        </FormField>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
          {submitting && <span className="spinner sm" />}
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}
