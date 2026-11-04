import { useMemo, useState } from 'react';
import { AlertTriangle, Calculator, CheckCircle2, RotateCcw } from 'lucide-react';
import { inr, toNumber } from '../lib/format';
import { CalculatorFrame, ResultCard, NumberLine } from '../components/CalculatorFrame';

function roundPrice(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const step = value < 100 ? 1 : value < 1000 ? 5 : 10;
  return Math.ceil(value / step) * step;
}

export function PricingCalculatorPage() {
  const [unitCost, setUnitCost] = useState('250');
  const [otherVariable, setOtherVariable] = useState('40');
  const [fixed, setFixed] = useState('30000');
  const [units, setUnits] = useState('200');
  const [margin, setMargin] = useState('35');
  const [fee, setFee] = useState('2');

  function reset() {
    setUnitCost('250');
    setOtherVariable('40');
    setFixed('30000');
    setUnits('200');
    setMargin('35');
    setFee('2');
  }

  const clamp = (value: string, min: number, max = Number.POSITIVE_INFINITY) =>
    String(Math.min(max, Math.max(min, toNumber(value))));

  const numbers = useMemo(() => {
    const direct = Math.max(0, toNumber(unitCost));
    const other = Math.max(0, toNumber(otherVariable));
    const variableCost = direct + other;
    const fixedCost = Math.max(0, toNumber(fixed));
    const expectedUnits = Math.max(1, toNumber(units));
    const targetMargin = Math.min(90, Math.max(0, toNumber(margin)));
    const feePct = Math.min(20, Math.max(0, toNumber(fee)));

    const fixedPerUnit = fixedCost / expectedUnits;
    const fullCost = variableCost + fixedPerUnit;
    const netPriceNeeded = targetMargin >= 100 ? fullCost : fullCost / (1 - targetMargin / 100);
    const price = netPriceNeeded / (1 - feePct / 100);
    const suggested = roundPrice(price);
    const netRevenue = suggested * (1 - feePct / 100);
    const profitPerUnit = netRevenue - fullCost;
    const actualMargin = netRevenue > 0 ? (profitPerUnit / netRevenue) * 100 : 0;
    const monthlyProfit = profitPerUnit * expectedUnits;
    const breakEvenUnits = netRevenue - variableCost > 0
      ? Math.ceil(fixedCost / (netRevenue - variableCost))
      : null;

    const scenarios = [20, 30, 40, 50].map((scenarioMargin) => {
      const net = fullCost / (1 - scenarioMargin / 100);
      const scenarioPrice = roundPrice(net / (1 - feePct / 100));
      const scenarioNet = scenarioPrice * (1 - feePct / 100);
      return {
        margin: scenarioMargin,
        price: scenarioPrice,
        profit: scenarioNet - fullCost,
      };
    });

    return {
      direct,
      other,
      variableCost,
      fixedCost,
      expectedUnits,
      targetMargin,
      feePct,
      fixedPerUnit,
      fullCost,
      price,
      suggested,
      netRevenue,
      profitPerUnit,
      actualMargin,
      monthlyProfit,
      breakEvenUnits,
      scenarios,
    };
  }, [unitCost, otherVariable, fixed, units, margin, fee]);

  return (
    <CalculatorFrame
      eyebrow="Free calculator · INR"
      title={<>Set a price that<br /><span className="italic text-brand-700">covers the whole business.</span></>}
      description="Most underpriced services forget fixed costs and payment fees. Work from unit cost, spread fixed costs over expected sales, then add your target margin."
      formTitle="Your cost structure"
      formDescription="Use per-unit numbers for products, or per-hour / per-project numbers for services."
      note={
        <>
          <strong className="text-ink-800">GST is not included.</strong> If you are registered, decide whether your
          quoted price is inclusive or exclusive of GST, and check the rate that applies to your product or service.
        </>
      }
      form={
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pricing-unit-cost" className="label">Direct cost / unit (₹)</label>
              <input id="pricing-unit-cost" type="number" min="0" value={unitCost} onChange={(event) => setUnitCost(event.target.value)} onBlur={() => setUnitCost(clamp(unitCost, 0))} className="input" />
            </div>
            <div>
              <label htmlFor="pricing-other" className="label">Other variable cost (₹)</label>
              <input id="pricing-other" type="number" min="0" value={otherVariable} onChange={(event) => setOtherVariable(event.target.value)} onBlur={() => setOtherVariable(clamp(otherVariable, 0))} className="input" />
            </div>
          </div>
          <p className="field-hint -mt-2">Packaging, delivery, payment fees or freelancer costs per order.</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pricing-fixed" className="label">Fixed costs / month (₹)</label>
              <input id="pricing-fixed" type="number" min="0" value={fixed} onChange={(event) => setFixed(event.target.value)} onBlur={() => setFixed(clamp(fixed, 0))} className="input" />
            </div>
            <div>
              <label htmlFor="pricing-units" className="label">Expected units / month</label>
              <input id="pricing-units" type="number" min="1" value={units} onChange={(event) => setUnits(event.target.value)} onBlur={() => setUnits(clamp(units, 1))} className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pricing-margin" className="label">Target margin (%)</label>
              <input id="pricing-margin" type="number" min="0" max="90" value={margin} onChange={(event) => setMargin(event.target.value)} onBlur={() => setMargin(clamp(margin, 0, 90))} className="input" />
            </div>
            <div>
              <label htmlFor="pricing-fee" className="label">Payment fee (%)</label>
              <input id="pricing-fee" type="number" min="0" max="20" value={fee} onChange={(event) => setFee(event.target.value)} onBlur={() => setFee(clamp(fee, 0, 20))} className="input" />
            </div>
          </div>
          <p className="field-hint -mt-2">
            Payment gateways and marketplaces charge different rates. Use the highest one you expect to pay, and add
            fixed per-transaction fees to your variable cost.
          </p>

          <button type="button" onClick={reset} className="btn-ghost btn-sm w-full" title="Reset to the example numbers">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset example numbers
          </button>
        </div>
      }
      result={
        <div className="space-y-5">
          <ResultCard
            title="Suggested selling price"
            subtitle="Rounded up so the price is easy to quote. This is a starting point, not a market verdict."
          >
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                <CheckCircle2 className="h-4 w-4 text-brand-700" aria-hidden="true" /> Recommended price
              </div>
              <p className="mt-2 font-display text-5xl text-ink-950">{inr(numbers.suggested)}</p>
              <p className="mt-1 text-xs text-ink-500">
                Exact target was {inr(numbers.price)} · after {numbers.feePct}% payment fee you keep {inr(numbers.netRevenue)}
              </p>
            </div>

            <div className="mt-4">
              <NumberLine label="Direct cost per unit" value={inr(numbers.direct)} />
              <NumberLine label="Other variable cost" value={inr(numbers.other)} />
              <NumberLine label="Fixed cost per unit" value={inr(numbers.fixedPerUnit)} hint={`${inr(numbers.fixedCost)} ÷ ${numbers.expectedUnits} units`} />
              <NumberLine label="Full cost per unit" value={inr(numbers.fullCost)} strong />
              <NumberLine label="Profit per unit after fee" value={inr(numbers.profitPerUnit)} strong />
              <NumberLine label="Actual margin" value={`${numbers.actualMargin.toFixed(1)}%`} />
              <NumberLine label={`Profit at ${numbers.expectedUnits} units`} value={inr(numbers.monthlyProfit)} strong />
            </div>
          </ResultCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <ResultCard title="Break-even volume" subtitle="Units needed each month to cover fixed costs at the suggested price.">
              <p className="font-display text-4xl text-ink-950">
                {numbers.breakEvenUnits === null ? 'Not reachable' : `${numbers.breakEvenUnits} units`}
              </p>
              <p className="mt-2 text-xs leading-5 text-ink-500">
                {numbers.breakEvenUnits === null
                  ? 'At this price, each sale contributes nothing toward fixed costs. Increase price or cut variable cost.'
                  : `You expect ${numbers.expectedUnits} units. That is ${numbers.expectedUnits >= numbers.breakEvenUnits ? 'above' : 'below'} break-even.`}
              </p>
            </ResultCard>
            <ResultCard title="Margin scenarios" subtitle="What different target margins do to the price.">
              <div className="divide-y divide-paper-100">
                {numbers.scenarios.map((scenario) => (
                  <div key={scenario.margin} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="text-ink-500">{scenario.margin}% margin</span>
                    <span className="font-semibold text-ink-900">{inr(scenario.price)}</span>
                    <span className="w-24 text-right text-[11px] text-ink-400">{inr(scenario.profit)} / unit</span>
                  </div>
                ))}
              </div>
            </ResultCard>
          </div>

          {numbers.profitPerUnit <= 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-ink-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
              <span>
                Your price does not cover full costs after payment fees. Raise the price, reduce fixed costs, sell
                more units to spread those costs, or change the cost structure before launching.
              </span>
            </div>
          )}

          <div className="rounded-xl border border-paper-300 bg-paper-100 p-4 text-[11px] leading-5 text-ink-500">
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink-700">
              <Calculator className="h-3.5 w-3.5" aria-hidden="true" /> Sanity-check the market
            </span>
            <p className="mt-1">
              A calculated price can still be above what customers will pay. Compare with three real competitors,
              test a small batch, and be ready to change the offer rather than only the number.
            </p>
          </div>
        </div>
      }
    />
  );
}
