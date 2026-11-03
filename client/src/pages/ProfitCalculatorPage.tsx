import { useMemo, useState } from 'react';
import { AlertTriangle, Calculator, TrendingUp } from 'lucide-react';
import { inr, toNumber } from '../lib/format';
import { CalculatorFrame, ResultCard, NumberLine, BarRow } from '../components/CalculatorFrame';

export function ProfitCalculatorPage() {
  const [revenue, setRevenue] = useState('100000');
  const [cogs, setCogs] = useState('40000');
  const [opex, setOpex] = useState('25000');
  const [ownerPay, setOwnerPay] = useState('15000');

  const numbers = useMemo(() => {
    const monthlyRevenue = Math.max(0, toNumber(revenue));
    const monthlyCogs = Math.max(0, toNumber(cogs));
    const monthlyOpex = Math.max(0, toNumber(opex));
    const monthlyOwnerPay = Math.max(0, toNumber(ownerPay));

    const grossProfit = monthlyRevenue - monthlyCogs;
    const grossMargin = monthlyRevenue > 0 ? (grossProfit / monthlyRevenue) * 100 : 0;
    const operatingProfit = grossProfit - monthlyOpex;
    const netProfit = operatingProfit - monthlyOwnerPay;
    const netMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;
    const fixedCosts = monthlyOpex + monthlyOwnerPay;
    const breakEvenRevenue = grossMargin > 0 ? fixedCosts / (grossMargin / 100) : 0;

    return {
      monthlyRevenue,
      monthlyCogs,
      monthlyOpex,
      monthlyOwnerPay,
      grossProfit,
      grossMargin,
      operatingProfit,
      netProfit,
      netMargin,
      fixedCosts,
      breakEvenRevenue,
      annualNet: netProfit * 12,
      canBreakEven: grossMargin > 0,
    };
  }, [revenue, cogs, opex, ownerPay]);

  const tone = numbers.netProfit > 0 ? 'good' : numbers.netProfit === 0 ? 'flat' : 'bad';

  return (
    <CalculatorFrame
      eyebrow="Free calculator · monthly INR"
      title={<>Profit is not<br /><span className="italic text-brand-700">the same as revenue.</span></>}
      description="Enter a typical month. The calculator separates gross profit, operating profit and what is actually left after paying yourself."
      formTitle="A typical month"
      formDescription="Use one normal month, not your best week. If revenue is seasonal, run the numbers for a slow month too."
      note={
        <>
          <strong className="text-ink-800">Not tax advice.</strong> This ignores GST, income tax, depreciation and
          interest unless you include them in operating costs. Ask a qualified accountant about your situation.
        </>
      }
      form={
        <div className="space-y-4">
          <div>
            <label htmlFor="profit-revenue" className="label">Monthly revenue (₹)</label>
            <input
              id="profit-revenue"
              type="number"
              min="0"
              value={revenue}
              onChange={(event) => setRevenue(event.target.value)}
              className="input"
            />
            <p className="field-hint">Money collected from sales or services, before expenses.</p>
          </div>
          <div>
            <label htmlFor="profit-cogs" className="label">Cost of goods sold (₹)</label>
            <input
              id="profit-cogs"
              type="number"
              min="0"
              value={cogs}
              onChange={(event) => setCogs(event.target.value)}
              className="input"
            />
            <p className="field-hint">Materials, stock, packaging and direct delivery per order.</p>
          </div>
          <div>
            <label htmlFor="profit-opex" className="label">Operating expenses (₹)</label>
            <input
              id="profit-opex"
              type="number"
              min="0"
              value={opex}
              onChange={(event) => setOpex(event.target.value)}
              className="input"
            />
            <p className="field-hint">Rent, utilities, software, marketing, salaries, fees.</p>
          </div>
          <div>
            <label htmlFor="profit-owner" className="label">Your pay / drawings (₹)</label>
            <input
              id="profit-owner"
              type="number"
              min="0"
              value={ownerPay}
              onChange={(event) => setOwnerPay(event.target.value)}
              className="input"
            />
            <p className="field-hint">What you need to take out each month. Zero hides the real cost of your time.</p>
          </div>
        </div>
      }
      result={
        <div className="space-y-5">
          <ResultCard
            title="What the month actually leaves"
            subtitle="Net profit after direct costs, operating costs and your own pay."
          >
            <div
              className={`rounded-xl border p-5 ${
                tone === 'good'
                  ? 'border-emerald-200 bg-emerald-50'
                  : tone === 'bad'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-paper-200 bg-paper-50'
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                <TrendingUp className="h-4 w-4 text-brand-600" aria-hidden="true" /> Net profit
              </div>
              <p className={`mt-2 font-display text-5xl ${numbers.netProfit < 0 ? 'text-amber-800' : 'text-ink-950'}`}>
                {inr(numbers.netProfit)}
              </p>
              <p className="mt-1 text-xs text-ink-500">
                {numbers.netMargin.toFixed(1)}% net margin · {inr(numbers.annualNet)} if repeated for 12 months
              </p>
            </div>

            <div className="mt-4">
              <NumberLine label="Revenue" value={inr(numbers.monthlyRevenue)} />
              <NumberLine label="Less: cost of goods sold" value={`− ${inr(numbers.monthlyCogs)}`} />
              <NumberLine label="Gross profit" value={inr(numbers.grossProfit)} strong hint={`${numbers.grossMargin.toFixed(1)}% gross margin`} />
              <NumberLine label="Less: operating expenses" value={`− ${inr(numbers.monthlyOpex)}`} />
              <NumberLine label="Operating profit" value={inr(numbers.operatingProfit)} strong />
              <NumberLine label="Less: your pay / drawings" value={`− ${inr(numbers.monthlyOwnerPay)}`} />
              <NumberLine label="Net profit" value={inr(numbers.netProfit)} strong />
            </div>
          </ResultCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <ResultCard title="Break-even revenue" subtitle="The monthly sales needed to cover fixed costs at your current gross margin.">
              <p className="font-display text-4xl text-ink-950">{numbers.canBreakEven ? inr(numbers.breakEvenRevenue) : 'Not possible yet'}</p>
              <p className="mt-2 text-xs leading-5 text-ink-500">
                {numbers.canBreakEven
                  ? `Fixed costs of ${inr(numbers.fixedCosts)} ÷ ${numbers.grossMargin.toFixed(1)}% gross margin. Below this, the month loses money.`
                  : 'Your gross margin is zero or negative. Raising prices or cutting direct costs must come first.'}
              </p>
            </ResultCard>
            <ResultCard title="Check the margin mix" subtitle="How each rupee of revenue is used.">
              <div className="space-y-3">
                <BarRow label="Cost of goods" amount={numbers.monthlyCogs} total={numbers.monthlyRevenue} tone="ink" />
                <BarRow label="Operating costs" amount={numbers.monthlyOpex} total={numbers.monthlyRevenue} tone="moss" />
                <BarRow label="Your pay" amount={numbers.monthlyOwnerPay} total={numbers.monthlyRevenue} tone="brand" />
              </div>
            </ResultCard>
          </div>

          {numbers.netProfit < 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-ink-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
              <span>
                This month loses {inr(Math.abs(numbers.netProfit))}. Losing money while testing is normal, but a
                repeated loss needs a decision: raise prices, cut direct costs, reduce fixed costs or change the
                model. Do not use new debt to hide a negative margin indefinitely.
              </span>
            </div>
          )}

          <div className="rounded-xl border border-paper-300 bg-paper-100 p-4 text-[11px] leading-5 text-ink-500">
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink-700">
              <Calculator className="h-3.5 w-3.5" aria-hidden="true" /> What this does not include
            </span>
            <p className="mt-1">
              GST, income tax, depreciation, loan interest, one-time setup costs and seasonal swings. Add them as
              operating costs where relevant, and get professional advice for tax.
            </p>
          </div>
        </div>
      }
    />
  );
}
