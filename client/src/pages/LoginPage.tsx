import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { AuthShell } from '../components/AuthShell';
import { FieldError } from '../components/ui';

function safeNext(value: string | null): string {
  if (!value) return '/dashboard';
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Log in — NO BS';
  }, []);

  if (user) return <Navigate to={next} replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    if (!email.trim()) {
      setFieldErrors({ email: 'Enter your email address.' });
      return;
    }
    if (!password) {
      setFieldErrors({ password: 'Enter your password.' });
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) {
          setFieldErrors(Object.fromEntries(err.details.map((detail) => [detail.path, detail.message])));
        }
      } else {
        setError('Could not log in. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title={<>Pick up where<br /><span className="italic text-brand-700">you left off.</span></>}
      description="Log in to see saved ideas, roadmaps and mentor conversations. Your session is kept in a secure, httpOnly cookie."
      footer={<>New here? <Link to={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-700 hover:text-brand-900">Create a free account</Link></>}
    >
      <div className="mb-6">
        <h2 className="font-display text-3xl text-ink-950">Log in</h2>
        <p className="mt-1 text-sm text-ink-500">Use the email and password you registered with.</p>
      </div>

      <form onSubmit={submit} noValidate className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="label">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input"
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          <FieldError>{fieldErrors.email}</FieldError>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="login-password" className="label">Password</label>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input pr-11"
              placeholder="Your password"
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-ink-400 hover:text-ink-800"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError>{fieldErrors.password}</FieldError>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-5 border-t border-paper-200 pt-4 text-[11px] leading-5 text-ink-400">
        There is no password-reset email in this local build. If you lose access, an administrator can
        reset the account directly in the database.
      </p>
    </AuthShell>
  );
}
