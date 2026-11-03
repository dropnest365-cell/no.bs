import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, BadgeCheck, BookOpen, Calculator, Check, Compass, ExternalLink,
  Landmark, ShieldCheck, X,
} from 'lucide-react';
import { PageHeader, SectionHeading } from '../components/ui';

const PRINCIPLES = [
  {
    icon: BadgeCheck,
    title: 'Specific over inspirational',
    text: 'Every business idea names customers, setup steps, cost ranges, risks and legal notes. No “just start” platitudes.',
  },
  {
    icon: Landmark,
    title: 'Official sources stay official',
    text: 'Registration and tax guides link to government portals. We do not dress up a blog as a primary source.',
  },
  {
    icon: Calculator,
    title: 'Estimates are labelled as estimates',
    text: 'Cost ranges are planning numbers for India, not quotes. They vary by city, scale and supplier.',
  },
  {
    icon: ShieldCheck,
    title: 'No income guarantees',
    text: 'We do not promise earnings, passive income or approvals. Business outcomes depend on execution and context.',
  },
];

export function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="About NO BS"
        title={<>Business advice<br /><span className="italic text-brand-700">without the theatre.</span></>}
        description="NO BS is a practical business and side-hustle library for India. The goal is not to hype you into spending money. It is to help you understand the real shape of an idea before you commit."
        actions={<Link to="/ideas" className="btn-primary">Explore the library <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
      />

      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">The premise</p>
            <h2 className="font-display text-4xl leading-tight text-ink-950 sm:text-5xl">
              Most business content is selling certainty. Real businesses run on evidence.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-ink-600 sm:text-base">
              <p>
                The internet is full of screenshots, income claims and vague advice that ignores costs, licensing and
                the unglamorous work of finding customers. That is not useful when you have limited savings and a
                day job.
              </p>
              <p>
                NO BS starts from a smaller question: what would it actually take to test this idea without risking
                more than you can afford? That means honest setup costs, a realistic time commitment, the first
                customers, the legal basics and the risks that are easy to skip.
              </p>
              <p>
                The tools are deliberately plain. A calculator shows its assumptions. A roadmap is a sequence of
                tasks, not a promise. An AI mentor is labelled as unverified and can be wrong.
              </p>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { value: '40', label: 'Business ideas' },
                { value: '45', label: 'Tools listed' },
                { value: '3', label: 'Calculators' },
                { value: '₹0', label: 'To use the basics' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-paper-200 bg-white p-4">
                  <p className="font-display text-3xl text-ink-950">{item.value}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-paper-300 bg-ink-950 p-6 text-paper-100">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <AlertTriangle className="h-4 w-4 text-brand-300" aria-hidden="true" /> What NO BS is not
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-paper-200/75">
                {[
                  'Not a get-rich-quick course or a franchise seller.',
                  'Not a lawyer, chartered accountant or financial adviser.',
                  'Not market research: we do not invent market-size statistics.',
                  'Not a guarantee of income, approvals or business success.',
                  'Not a place where AI output is treated as verified fact.',
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <X className="mt-1 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-paper-200 bg-paper-50 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Compass className="h-4 w-4 text-brand-600" aria-hidden="true" /> How to use this site
              </p>
              <ol className="mt-3 space-y-2 text-xs leading-6 text-ink-600 [counter-reset:item]">
                {['Pick one idea and read the risks.', 'Check the official links yourself.', 'Run the cost and profit numbers.', 'Test demand before spending big.', 'Build a plan with dates and tasks.'].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-moss-600" aria-hidden="true" /> {item}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>

      <section className="border-y border-paper-200 bg-paper-50">
        <div className="container-page py-12 sm:py-16">
          <SectionHeading
            eyebrow="Editorial rules"
            title="The standards we try to hold"
            description="These are operating principles, not a claim of perfection. Content can be incomplete or become outdated."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((item) => (
              <div key={item.title} className="rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-display text-2xl text-ink-950">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-ink-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">How content is made</p>
            <h2 className="font-display text-4xl leading-tight text-ink-950">Research, write, label, review.</h2>
            <p className="mt-4 text-sm leading-7 text-ink-600">
              Each guide is written as a practical starting map. The process is intentionally boring: define the
              customer, trace the setup steps, estimate costs, note the risks, link the official portal and record a
              review date.
            </p>
            <Link to="/guides" className="btn-secondary mt-5">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> Read the guides
            </Link>
          </div>
          <ol className="space-y-4">
            {[
              { step: '01', title: 'Start with the customer problem', text: 'Who pays, for what, and why would they choose this over the alternative? If that is unclear, the idea is not ready.' },
              { step: '02', title: 'Map the setup honestly', text: 'List skills, equipment, recurring costs and the first practical steps. Include the parts that are boring or uncomfortable.' },
              { step: '03', title: 'Link official requirements', text: 'Registration, licensing and tax notes point to government portals. We say “verify” where rules change.' },
              { step: '04', title: 'Label every estimate', text: 'Costs and timelines are planning ranges, not quotes. We avoid invented success rates and income promises.' },
              { step: '05', title: 'Review and correct', text: 'Pages carry a last-reviewed date. If a link or rule is wrong, the contact form is the correction channel.' },
            ].map((item) => (
              <li key={item.step} className="flex gap-4 rounded-xl border border-paper-200 bg-white p-4">
                <span className="font-display text-3xl text-brand-300">{item.step}</span>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
                  <p className="mt-1 text-xs leading-6 text-ink-600">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <section className="border-t border-paper-200 bg-white">
        <div className="container-page py-12 sm:py-16">
          <div className="rounded-2xl border border-paper-300 bg-paper-50 p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <p className="eyebrow mb-2">Corrections and contact</p>
                <h2 className="font-display text-3xl text-ink-950 sm:text-4xl">Found something wrong or outdated?</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-ink-600">
                  Send the page link and what changed. Corrections are more useful than complaints. For legal, tax or
                  financial decisions, speak to a qualified professional who knows your situation.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/contact" className="btn-primary">Contact NO BS <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                  <Link to="/privacy" className="btn-secondary">Read the privacy policy</Link>
                </div>
              </div>
              <div className="rounded-xl border border-paper-200 bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <ExternalLink className="h-4 w-4 text-brand-600" aria-hidden="true" /> Trust checklist
                </p>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-ink-600">
                  <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-600" aria-hidden="true" /> Does the page distinguish official links from estimates?</li>
                  <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-600" aria-hidden="true" /> Does it show a last-reviewed date?</li>
                  <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-600" aria-hidden="true" /> Does it avoid income promises?</li>
                  <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-600" aria-hidden="true" /> Can you verify the claim on a first-party site?</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
