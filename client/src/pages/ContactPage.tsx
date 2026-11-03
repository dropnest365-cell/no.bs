import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, MessageSquare, Send, ShieldAlert } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, FieldError, ErrorBlock } from '../components/ui';

export function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName((current) => current || user.name);
      setEmail((current) => current || user.email);
    }
  }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    setError('');
    setSuccess('');
    if (name.trim().length < 2) nextErrors.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (message.trim().length < 10) nextErrors.message = 'Write at least 10 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await api<{ message: string }>('/api/contact', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim(), message: message.trim() },
      });
      setSuccess(response.message);
      setMessage('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) setErrors(Object.fromEntries(err.details.map((detail) => [detail.path, detail.message])));
      } else {
        setError('Could not send the message.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Contact"
        title={<>Ask a specific question.<br /><span className="italic text-brand-700">Get a specific answer.</span></>}
        description="Use this form to report an outdated link, correct a factual error, ask about your account or suggest a business idea. It is not a channel for legal, tax or financial advice."
      />

      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <section className="rounded-2xl border border-paper-300 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-3xl text-ink-950">Send a message</h2>
            <p className="mt-1 text-sm leading-6 text-ink-500">
              This local build stores messages in the database. No email is sent automatically, so response times
              depend on the operator checking the admin panel.
            </p>

            {success && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900" role="status">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{success}</span>
              </div>
            )}
            {error && <ErrorBlock message={error} className="mt-5" />}

            <form onSubmit={submit} noValidate className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="label">Your name</label>
                  <input
                    id="contact-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="input"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                  />
                  <FieldError>{errors.name}</FieldError>
                </div>
                <div>
                  <label htmlFor="contact-email" className="label">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="input"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                  <FieldError>{errors.email}</FieldError>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="label">Message</label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="textarea min-h-[180px]"
                  placeholder="Example: The Udyam link on the registration guide returns a 404. Here is the current official URL…"
                  maxLength={3000}
                  aria-invalid={Boolean(errors.message)}
                />
                <div className="flex items-baseline justify-between">
                  <FieldError>{errors.message}</FieldError>
                  <p className="mt-1.5 text-[10px] text-ink-400">{message.length}/3000</p>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary">
                <Send className="h-4 w-4" aria-hidden="true" /> {submitting ? 'Sending…' : 'Send message'}
              </button>
              <p className="text-[11px] leading-5 text-ink-400">
                Do not include passwords, card numbers, Aadhaar numbers or other sensitive documents.
              </p>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-paper-200 bg-paper-50 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <MessageSquare className="h-4 w-4 text-brand-600" aria-hidden="true" /> Good reasons to write
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-ink-600">
                {[
                  'Report an outdated official link or fee.',
                  'Flag a claim that needs a source.',
                  'Ask about account access or data deletion.',
                  'Suggest a business idea for the library.',
                  'Report a bug or an accessibility issue.',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <ShieldAlert className="h-4 w-4 text-amber-700" aria-hidden="true" /> What we cannot do
              </p>
              <p className="mt-2 text-xs leading-6 text-ink-600">
                We cannot provide legal, tax, investment or accounting advice, review your contracts, guarantee a
                licence approval or promise business results. Please consult a qualified professional.
              </p>
            </div>

            <div className="rounded-2xl border border-paper-200 bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Mail className="h-4 w-4 text-brand-600" aria-hidden="true" /> Data note
              </p>
              <p className="mt-2 text-xs leading-6 text-ink-600">
                Your name, email and message are stored so the operator can respond. They are not added to a
                marketing list. Read the <a href="/privacy" className="font-semibold text-brand-700 underline underline-offset-2">privacy policy</a> for deletion requests.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
