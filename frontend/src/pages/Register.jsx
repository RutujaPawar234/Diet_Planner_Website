import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import FormField from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { fieldErrorsFrom, validateRegister } from '../utils/validation';

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score += 1;
  return score;
}

const STRENGTH = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const strength = passwordStrength(form.password);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateRegister(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast.success('Account created! Let’s set up your profile.');
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than two minutes to get your first plan."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError && <ErrorMessage message={serverError} />}
        <FormField label="Full name" error={errors.name}>
          {(p) => <input {...p} autoComplete="name" className={`input ${errors.name ? 'invalid' : ''}`} placeholder="Priya Sharma" value={form.name} onChange={set('name')} />}
        </FormField>
        <FormField label="Email" error={errors.email}>
          {(p) => <input {...p} type="email" autoComplete="email" className={`input ${errors.email ? 'invalid' : ''}`} placeholder="you@example.com" value={form.email} onChange={set('email')} />}
        </FormField>
        <FormField label="Password" error={errors.password} hint="At least 8 characters with a letter and a number">
          {(p) => <PasswordInput {...p} autoComplete="new-password" invalid={errors.password} placeholder="Create a password" value={form.password} onChange={set('password')} />}
        </FormField>
        {form.password && (
          <div className="strength" aria-live="polite">
            <div className="strength-bars">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={i <= strength ? `on s${strength}` : ''} />
              ))}
            </div>
            <span className="tiny muted">{STRENGTH[strength]}</span>
          </div>
        )}
        <FormField label="Confirm password" error={errors.confirmPassword}>
          {(p) => <PasswordInput {...p} autoComplete="new-password" invalid={errors.confirmPassword} placeholder="Repeat your password" value={form.confirmPassword} onChange={set('confirmPassword')} />}
        </FormField>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
          {submitting && <span className="spinner sm" />}
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
        <p className="tiny muted center">By continuing you agree that NutriPlan provides general wellness guidance, not medical advice.</p>
      </form>
    </AuthLayout>
  );
}
