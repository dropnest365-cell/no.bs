import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, RotateCcw, Trash2, Wallet } from 'lucide-react';
import { inr, toNumber } from '../lib/format';
import { CalculatorFrame, ResultCard, NumberLine, BarRow } from '../components/CalculatorFrame';

interface CostItem {
  id: number;
  label: string;
  amount: string;
}

let nextId = 1;
const uid = () => nextId++;

const STARTING_ITEMS: CostItem[] = [
  { id: uid(), label: 'Equipment and tools', amount: '15000' },
  { id: uid(), label: 'Rent deposit / advance', amount: '20000' },
  { id: uid(), label: 'Initial stock or materials', amount: '10000' },
  { id: uid(), label: 'Registrations and licences', amount: '3000' },
  { id: uid(), label: 'Launch marketing', amount: '5000' },
  { id: uid(), label: 'Other setup costs', amount: '5000' },
];

export function StartupCostCalculatorPage() {
  const [items, setItems] = useState<CostItem[]>(STARTING_ITEMS);
  const [contingency, setContingency] = useState('10');
  const [monthly, setMonthly] = useState('8000');
  const [runway, setRunway] = useState('3');
  const [available, setAvailable] = useState('');

  const numbers = useMemo(() => {
    const oneTime = items.reduce((sum, item) => sum + Math.max(0, toNumber(item.amount)), 0);
    const contingencyPct = Math.min(50, Math.max(0, toNumber(contingency)));
    const contingencyAmount = Math.round((oneTime * contingencyPct) / 100);
    const startupTotal = oneTime + contingencyAmount;
    const monthlyCost = Math.max(0, toNumber(monthly));
    const runwayMonths = Math.min(36, Math.max(0, Math.floor(toNumber(runway))));
    const runwayCost = monthlyCost * runwayMonths;
    const cashNeeded = startupTotal + runwayCost;
    const cashAvailable = available.trim() ? Math.max(0, toNumber(available)) : null;
    return {
      oneTime,
      contingencyPct,
      contingencyAmount,
      startupTotal,
      monthlyCost,
      runwayMonths,
      runwayCost,
      cashNeeded,
      cashAvailable,
      gap: cashAvailable === null ? null : cashAvailable - cashNeeded,
    };
  }, [items, contingency, monthly, runway, available]);

  function update(id: number, key: 'label' | 'amount', value: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  }

  function remove(id: number) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function reset() {
    setItems(STARTING_ITEMS.map((item) => ({ ...item })));
    setContingency('10');
    setMonthly('8000');
    setRunway('3');
    setAvailable('');
  }

  return (
    <CalculatorFrame
      eyebrow="Free calculator · INR"
      title={<>What will it<br /><span className="italic text-brand-700">really cost to start?</span></>}
      description="Add the one-time setup costs, keep a contingency and include a few months of running costs. The total is the cash you need before revenue arrives."
      formTitle="Your setup costs"
      formDescription="Edit the labels and amounts to match your plan. Use realistic supplier quotes where you have them."
      note={
        <>
          <strong className="text-ink-800">Estimates only.</strong> Registration fees, deposits and equipment costs
          vary by state, city and scale. Confirm official fees on the relevant government portal.
        </>
      }
      form={
        <div className="space-y-4">
          <div className="space-y-2.5">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <input
                    aria-label="Cost label"
                    value={item.label}
                    onChange={(event) => update(item.id, 'label', event.target.value)}
                    className="input h-9 px-2.5 text-xs"
                    placeholder="Cost item"
                  />
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-400">₹</span>
                    <input
                      aria-label={`Amount for ${item.label || 'cost item'}`}
                      type="number"
                      min="0"
                      value={item.amount}
                      onChange={(event) => update(item.id, 'amount', event.target.value)}
                      onBlur={() => update(item.id, 'amount', String(Math.max(0, toNumber(item.amount))))}
                      className="input h-9 pl-6 text-xs"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="mt-1 rounded p-1.5 text-ink-300 hover:bg-red-50 hover:text-red-700"
                  aria-label={`Remove ${item.label || 'cost item'}`}
                  disabled={items.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setItems((current) => [...current, { id: uid(), label: 'New cost', amount: '0' }])}
              className="btn-secondary btn-sm flex-1"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add another cost
            </button>
            <button
              type="button"
              onClick={reset}
              className="btn-ghost btn-sm"
              title="Reset to the example numbers"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-paper-200 pt-4">
            <div>
              <label htmlFor="startup-contingency" className="label">Contingency (%)</label>
              <input
                id="startup-contingency"
                type="number"
                min="0"
                max="50"
                value={contingency}
                onChange={(event) => setContingency(event.target.value)}
                onBlur={() => setContingency(String(Math.min(50, Math.max(0, toNumber(contingency)))))}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="startup-runway" className="label">Runway (months)</label>
              <input
                id="startup-runway"
                type="number"
                min="0"
                max="36"
                value={runway}
                onChange={(event) => setRunway(event.target.value)}
                onBlur={() => setRunway(String(Math.min(36, Math.max(0, Math.floor(toNumber(runway))))))}
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="startup-monthly" className="label">Monthly running costs (₹)</label>
            <input
              id="startup-monthly"
              type="number"
              min="0"
              value={monthly}
              onChange={(event) => setMonthly(event.target.value)}
              onBlur={() => setMonthly(String(Math.max(0, toNumber(monthly))))}
              className="input"
            />
            <p className="field-hint">Rent, utilities, subscriptions, transport and your own basic draw.</p>
          </div>

          <div>
            <label htmlFor="startup-available" className="label">Cash available (optional)</label>
            <input
              id="startup-available"
              type="number"
              min="0"
              value={available}
              onChange={(event) => setAvailable(event.target.value)}
              onBlur={() => setAvailable(available.trim() ? String(Math.max(0, toNumber(available))) : '')}
              className="input"
              placeholder="e.g. 100000"
            />
            <p className="field-hint">Used only to show a shortfall or surplus. Nothing is saved.</p>
          </div>
        </div>
      }
      result={
        <div className="space-y-5">
          <ResultCard
            title="Cash you need before you earn"
            subtitle="One-time setup plus contingency plus the runway you chose. This is a planning number, not a loan offer."
          >
            <div className="rounded-xl border border-paper-200 bg-paper-50 p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                <Wallet className="h-4 w-4 text-brand-600" aria-hidden="true" /> Total cash required
              </div>
              <p className="mt-2 font-display text-5xl text-ink-950">{inr(numbers.cashNeeded)}</p>
              <p className="mt-1 text-xs text-ink-500">
                {inr(numbers.startupTotal)} to set up + {inr(numbers.runwayCost)} for {numbers.runwayMonths || 0} month{numbers.runwayMonths === 1 ? '' : 's'} of running costs
              </p>
            </div>

            <div className="mt-4">
              <NumberLine label="One-time setup costs" value={inr(numbers.oneTime)} />
              <NumberLine label={`Contingency (${numbers.contingencyPct}%)`} value={inr(numbers.contingencyAmount)} hint="For price changes, delays and the thing you forgot." />
              <NumberLine label="Setup total" value={inr(numbers.startupTotal)} strong />
              <NumberLine label={`Running costs × ${numbers.runwayMonths || 0} months`} value={inr(numbers.runwayCost)} />
              <NumberLine label="Total cash required" value={inr(numbers.cashNeeded)} strong />
            </div>

            {numbers.gap !== null && (
              <div
                className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-5 ${
                  numbers.gap >= 0
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-amber-200 bg-amber-50 text-ink-700'
                }`}
              >
                {numbers.gap >= 0 ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                )}
                <span>
                  {numbers.gap >= 0 ? (
                    <>At {inr(numbers.cashAvailable || 0)} available, you have a surplus of <strong>{inr(numbers.gap)}</strong> against this plan. Keep it as a buffer, not spending money.</>
                  ) : (
                    <>At {inr(numbers.cashAvailable || 0)} available, you are short by <strong>{inr(Math.abs(numbers.gap))}</strong>. Reduce scope, start smaller or wait until you have the cash.</>
                  )}
                </span>
              </div>
            )}
          </ResultCard>

          <ResultCard title="Where the money goes" subtitle="A quick visual check on the setup and runway split.">
            <div className="space-y-3">
              <BarRow label="One-time costs" amount={numbers.oneTime} total={numbers.cashNeeded} />
              <BarRow label="Contingency" amount={numbers.contingencyAmount} total={numbers.cashNeeded} tone="ink" />
              <BarRow label="Running-cost runway" amount={numbers.runwayCost} total={numbers.cashNeeded} tone="moss" />
            </div>
            <p className="mt-4 border-t border-paper-200 pt-3 text-[11px] leading-5 text-ink-500">
              A 10–15% contingency is a common planning habit, not a rule. A business with volatile material
              costs or long licensing delays may need more.
            </p>
          </ResultCard>
        </div>
      }
    />
  );
}
