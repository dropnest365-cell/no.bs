import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { AuthShell } from '../components/AuthShell';
import { FieldError } from '../components/ui';

function safeNext(value: string | null): string {
  if (!value) return '/dashboard';
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Create an account — NO BS';
  }, []);

  if (user) return <Navigate to={next} replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    setError('');
    if (name.trim().length < 2) nextErrors.name = 'Enter your name (at least 2 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 10) nextErrors.password = 'Use at least 10 characters.';
    if (password !== confirm) nextErrors.confirm = 'Passwords do not match.';
    if (!accepted) nextErrors.accepted = 'Please accept the terms to create an account.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) {
          setFieldErrors(Object.fromEntries(err.details.map((detail) => [detail.path, detail.message])));
        }
      } else {
        setError('Could not create the account. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Free account"
      title={<>Save the work.<br /><span className="italic text-brand-700">Skip the noise.</span></>}
      description="A free account keeps your bookmarks, roadmaps and mentor history in one place. No card, no trial timer, no marketing email."
      footer={<>Already have an account? <Link to={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-700 hover:text-brand-900">Log in</Link></>}
    >
      <div className="mb-6">
        <h2 className="font-display text-3xl text-ink-950">Create an account</h2>
        <p className="mt-1 text-sm text-ink-500">Takes less than a minute. You can start with the free tools first.</p>
      </div>

      <form onSubmit={submit} noValidate className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="register-name" className="label">Your name</label>
          <input
            id="register-name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input"
            placeholder="Aditya Raj"
            aria-invalid={Boolean(fieldErrors.name)}
          />
          <FieldError>{fieldErrors.name}</FieldError>
        </div>

        <div>
          <label htmlFor="register-email" className="label">Email</label>
          <input
            id="register-email"
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
          <label htmlFor="register-password" className="label">Password</label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input pr-11"
              placeholder="At least 10 characters"
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
          <p className="field-hint">Minimum 10 characters. A passphrase is better than a short password.</p>
        </div>

        <div>
          <label htmlFor="register-confirm" className="label">Confirm password</label>
          <input
            id="register-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="input"
            placeholder="Repeat your password"
            aria-invalid={Boolean(fieldErrors.confirm)}
          />
          <FieldError>{fieldErrors.confirm}</FieldError>
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-ink-600">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-paper-400 accent-brand-700"
            />
            <span>
              I accept the <Link to="/terms" className="font-semibold text-brand-700 underline underline-offset-2">terms</Link> and
              understand the <Link to="/privacy" className="font-semibold text-brand-700 underline underline-offset-2">privacy policy</Link>.
            </span>
          </label>
          <FieldError>{fieldErrors.accepted}</FieldError>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          {submitting ? 'Creating account…' : 'Create free account'}
        </button>
      </form>

      <ul className="mt-5 space-y-1.5 border-t border-paper-200 pt-4 text-[11px] text-ink-500">
        {['No card required', 'No marketing email from this local build', 'You can delete your data via the contact page'].map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <Check className="h-3 w-3 text-moss-600" aria-hidden="true" /> {item}
          </li>
        ))}
      </ul>
    </AuthShell>
  );
}
