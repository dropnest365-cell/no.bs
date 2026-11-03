import { inferDomain } from './discovery.js';
import { parseJson } from '../lib/serializers.js';

const DISCLAIMER =
  'This is a structured starting analysis, not a market study, financial forecast or guarantee of success. Validate demand with real customers and verify legal, tax and licensing details on official portals.';

function asStringList(value) {
  const list = Array.isArray(value) ? value : parseJson(value, []);
  return Array.isArray(list) ? list.filter((item) => typeof item === 'string' && item.trim()) : [];
}

function budgetNote(budget, min, max) {
  if (!budget || !min) return null;
  const inr = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  if (budget < min) {
    return `Your stated budget of ${inr(budget)} is below the library planning range of ${inr(min)}–${inr(max)}. Consider a smaller test version, a service-first model, renting equipment, or saving longer before committing.`;
  }
  if (budget > max) {
    return `Your stated budget of ${inr(budget)} is above the library planning range of ${inr(min)}–${inr(max)}. Keep a reserve and avoid spending the full amount before demand is proven.`;
  }
  return `Your stated budget of ${inr(budget)} falls inside the library planning range of ${inr(min)}–${inr(max)}. Treat the range as a rough estimate, not a quote.`;
}

export function buildRuleBasedAnalysis({ ideaText, budget, location, relatedIdeas = [] }) {
  const domain = inferDomain(ideaText);
  const match = relatedIdeas[0];
  const locationText = location?.trim() || 'your target area';

  const audience = match
    ? match.targetCustomers
    : `${domain.audience.charAt(0).toUpperCase()}${domain.audience.slice(1)} in ${locationText}. Narrow this further by age, income, location and buying occasion before spending on marketing.`;

  const problem = match
    ? match.competition
    : domain.problem;

  const summary = `A first-pass look at "${ideaText.slice(0, 180)}${ideaText.length > 180 ? '…' : ''}". The core opportunity is a ${domain.label} offer for ${locationText}. The main job now is to prove that a specific group will pay, at a price that leaves a workable margin. This analysis lists assumptions to test; it does not predict demand.`;

  const startupRequirements = [
    ...asStringList(match?.equipment).slice(0, 5),
    ...domain.requirements,
  ];
  const uniqueRequirements = [...new Set(startupRequirements)].slice(0, 10);

  const revenueModels = [
    ...asStringList(match?.revenueStreams),
    ...domain.revenue,
  ];
  const uniqueRevenue = [...new Set(revenueModels)].slice(0, 8);

  const risks = [...new Set([...asStringList(match?.risks), ...domain.risks])].slice(0, 8);
  const skillsNeeded = [...new Set([...asStringList(match?.skills), ...domain.skills])].slice(0, 8);

  const estimatedStartupCost = match
    ? {
        min: match.startingCostMin,
        max: match.startingCostMax,
        note: 'Planning range from a similar NO BS guide. Actual costs vary by city, supplier, scale and whether you already own equipment.',
      }
    : null;

  const advantages = [
    match ? `A similar business model already has a documented guide in the library (${match.title}).` : 'The model can be tested with a narrow offer before a large investment.',
    'You can speak directly to potential customers and adjust the offer quickly.',
    budget ? `Your stated budget gives you a defined ceiling for the first test.` : 'Fixed costs can be kept low in the first version.',
    'Customer conversations will produce better evidence than a large launch.',
  ].slice(0, 5);

  const disadvantages = [
    match ? 'Competition and pricing pressure are likely; a generic version will be hard to differentiate.' : 'Demand is unproven until people actually pay.',
    'Finding customers consistently will take more effort than building the offer.',
    ...(domain.key === 'food'
      ? ['Licensing, hygiene and waste management add operational work before launch.']
      : domain.key === 'software'
        ? ['Support, security and maintenance continue after the first sale.']
        : ['Owner time and manual operations may limit how much you can sell.']),
  ].slice(0, 5);

  const improvements = [
    ...domain.improvements,
    'Interview 10 potential customers and write down the exact words they use for the problem.',
    'Run a two-week paid test with a spending cap and a defined success measure.',
    'Calculate unit economics including payment fees, returns, delivery and your own time.',
    'Set a written rule for when you will continue, change or stop.',
    location ? `Check local competition and footfall or delivery density in ${locationText} before signing a lease.` : 'Check local competition and access before committing to a location.',
  ].slice(0, 9);

  const firstSteps = [
    'Write the offer as one sentence: customer, problem, outcome and price range.',
    'List 20 potential customers you can contact this week.',
    'Speak to 10 of them about what they currently do, not what they think of your idea.',
    'Build the smallest paid test you can deliver reliably.',
    'Set a budget cap and a stop/continue rule before starting.',
  ];

  const verdict = 'This idea may be worth testing, but the evidence does not exist yet. Start with customer conversations and a small paid pilot; do not treat this analysis as validation.';

  return {
    summary,
    targetMarket: match
      ? `The closest library guide targets ${match.targetCustomers} Use that as a starting hypothesis and narrow it for ${locationText}.`
      : `Start with customers in ${locationText} who already spend money on an alternative. Define the segment by behaviour (what they buy today), not just demographics.`,
    customerProblem: `Likely problem: ${problem} Test this wording with real customers and rewrite it in their language.`,
    targetAudience: audience,
    competition: match
      ? `${match.competition} Also list informal alternatives, online options and the choice to do nothing.`
      : `Direct competitors are only part of the picture. Include informal providers, online alternatives and the option of doing nothing. Compare price, convenience, trust and speed, and identify one thing you can credibly do better.`,
    startupRequirements: uniqueRequirements,
    revenueModels: uniqueRevenue,
    risks,
    advantages,
    disadvantages,
    skillsNeeded,
    improvements,
    firstSteps,
    verdict,
    estimatedStartupCost,
    budgetCheck: estimatedStartupCost
      ? budgetNote(budget, estimatedStartupCost.min, estimatedStartupCost.max)
      : budget
        ? 'No reliable cost range is available for this custom idea. Build a bottom-up cost list before committing.'
        : null,
    relatedIdeas: relatedIdeas.slice(0, 3).map((idea) => ({
      slug: idea.slug,
      title: idea.title,
      summary: idea.summary,
      mode: idea.mode,
      startingCostMin: idea.startingCostMin,
      startingCostMax: idea.startingCostMax,
    })),
    source: 'RULE_BASED',
    disclaimer: DISCLAIMER,
  };
}

export function normalizeAiAnalysis(analysis, relatedIdeas, budget) {
  const cost = relatedIdeas[0]
    ? {
        min: relatedIdeas[0].startingCostMin,
        max: relatedIdeas[0].startingCostMax,
        note: 'Planning range from a similar NO BS guide. Actual costs vary by city, supplier and scale.',
      }
    : null;
  return {
    ...analysis,
    estimatedStartupCost: cost,
    budgetCheck: cost ? budgetNote(budget, cost.min, cost.max) : null,
    relatedIdeas: relatedIdeas.slice(0, 3).map((idea) => ({
      slug: idea.slug,
      title: idea.title,
      summary: idea.summary,
      mode: idea.mode,
      startingCostMin: idea.startingCostMin,
      startingCostMax: idea.startingCostMax,
    })),
    disclaimer: DISCLAIMER,
  };
}
