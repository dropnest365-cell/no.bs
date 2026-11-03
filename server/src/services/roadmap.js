import { findRelevantIdeas, inferDomain } from './discovery.js';

const DISCLAIMER =
  'This roadmap is a planning aid generated from your inputs and NO BS reference content. Timelines and costs are estimates, not guarantees. Verify legal, tax and licensing requirements on official portals, and adjust the plan as you learn from customers.';

function money(value) {
  return `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;
}

function task(id, title, priority = 'MEDIUM') {
  return { id, title, priority, done: false };
}

export function generateRoadmap(input, ideas = []) {
  const idea = input.idea.trim();
  const budget = Math.max(0, Number(input.budget) || 0);
  const location = input.location.trim();
  const skills = input.skills?.trim() || 'skills you already have, plus gaps to fill with partners or training';
  const timeAvailable = input.timeAvailable?.trim() || '10–15 hours per week';
  const goals = input.goals?.trim() || 'validate demand and reach the first paying customers';

  const domain = inferDomain(idea);
  const matches = findRelevantIdeas(ideas, idea, 2);
  const reference = matches[0];
  const setupBudget = Math.round(budget * 0.45);
  const stockBudget = Math.round(budget * 0.2);
  const marketingBudget = Math.round(budget * 0.15);
  const reserve = Math.round(budget * 0.15);
  const researchBudget = Math.max(0, budget - setupBudget - stockBudget - marketingBudget - reserve);

  const legalTask =
    domain.key === 'food'
      ? 'Verify FSSAI registration or licence through FoSCoS, plus municipal and fire requirements for your premises.'
      : domain.key === 'fitness'
        ? 'Confirm certification, client screening and local premises requirements before training clients.'
        : domain.key === 'home-services'
          ? 'Check Shops and Establishments, local trade licence and any waste or safety rules for your service.'
          : domain.key === 'software'
            ? 'Publish terms and a privacy policy; confirm GST treatment for software services before invoicing.'
            : 'Confirm registration, GST and local licence requirements for your activity on official portals.';

  const validationTask = reference
    ? `Read the NO BS guide for ${reference.title} and note the legal, cost and risk sections that apply to ${location}.`
    : `Find three comparable businesses in ${location} and document their prices, offers and customer complaints.`;

  const stages = [
    {
      key: 'research',
      title: 'Research',
      summary: `Test the demand hypothesis before spending. Your available time is ${timeAvailable}.`,
      timeline: 'Weeks 1–2',
      tasks: [
        task('research-1', `Write the offer in one sentence: customer, problem, outcome and price for "${idea}".`, 'HIGH'),
        task('research-2', `Interview 10 potential customers in ${location} about what they currently do and pay.`, 'HIGH'),
        task('research-3', validationTask, 'HIGH'),
        task('research-4', 'Estimate unit economics: price, direct cost, delivery cost, fees, returns and your time.', 'HIGH'),
        task('research-5', 'Set a written test budget and a stop / continue rule.', 'MEDIUM'),
        task('research-6', `List the skills you have (${skills}) and the gaps you must fill.`, 'MEDIUM'),
      ],
    },
    {
      key: 'preparation',
      title: 'Preparation',
      summary: 'Turn the hypothesis into a small, compliant offer you can deliver reliably.',
      timeline: 'Weeks 2–4',
      tasks: [
        task('prep-1', 'Choose a legal structure or start as a sole proprietor if appropriate; do not over-register early.', 'HIGH'),
        task('prep-2', legalTask, 'HIGH'),
        task('prep-3', 'Open a separate bank account and set up a simple bookkeeping sheet or tool.', 'HIGH'),
        task('prep-4', `Set prices and payment terms. Allocate about ${money(setupBudget)} for setup, ${money(stockBudget)} for stock/equipment and keep ${money(reserve)} as reserve.`, 'HIGH'),
        task('prep-5', 'Create the smallest version of the product or service that delivers one complete outcome.', 'HIGH'),
        task('prep-6', 'Prepare invoices, a refund or cancellation policy, and a customer contact channel.', 'MEDIUM'),
        ...(domain.key === 'food'
          ? [task('prep-7', 'Set up hygiene, storage and packaging procedures; order only after checking supplier quality.', 'HIGH')]
          : domain.key === 'software'
            ? [task('prep-7', 'Add authentication, backups, error monitoring and a privacy policy before onboarding users.', 'HIGH')]
            : [task('prep-7', 'Create a simple booking or order process and a customer record sheet.', 'MEDIUM')]),
      ],
    },
    {
      key: 'setup',
      title: 'Setup',
      summary: 'Build the operating base without spending the full budget.',
      timeline: 'Weeks 3–6',
      tasks: [
        task('setup-1', `Secure premises, suppliers or equipment within the ${money(setupBudget)} setup allocation. Avoid long leases before demand is proven.`, 'HIGH'),
        task('setup-2', 'Test the delivery process end to end with two friendly users or sample customers.', 'HIGH'),
        task('setup-3', 'Create three proof assets: a clear service/product page, photos or samples, and a price list.', 'MEDIUM'),
        task('setup-4', 'Set up a simple way to capture enquiries, orders and follow-ups.', 'MEDIUM'),
        task('setup-5', 'Document your daily and weekly operating checklist so quality does not depend on memory.', 'MEDIUM'),
      ],
    },
    {
      key: 'launch',
      title: 'Launch',
      summary: 'Launch narrowly to people who can give you real feedback and payment.',
      timeline: 'Weeks 6–8',
      tasks: [
        task('launch-1', 'Make a list of 50 warm prospects and contact them directly with a specific offer.', 'HIGH'),
        task('launch-2', domain.key === 'ecommerce' || domain.key === 'creative'
          ? 'Publish accurate listings or a portfolio with real photos, prices and delivery or booking terms.'
          : 'Create or claim a Google Business Profile and a simple page with location, hours and contact details.', 'HIGH'),
        task('launch-3', `Set aside about ${money(marketingBudget)} for a time-boxed launch test, not open-ended advertising.`, 'HIGH'),
        task('launch-4', 'Offer a founding-customer package with a clear scope and a request for honest feedback.', 'MEDIUM'),
        task('launch-5', 'Track enquiries, conversion, delivery time and complaints in one place.', 'HIGH'),
      ],
    },
    {
      key: 'marketing',
      title: 'Marketing',
      summary: 'Choose one channel and one message, then improve based on qualified enquiries.',
      timeline: 'Weeks 8–12',
      tasks: [
        task('marketing-1', 'Pick one primary acquisition channel based on where your customers already search or gather.', 'HIGH'),
        task('marketing-2', 'Publish or show up consistently for eight weeks; do not switch channels every week.', 'HIGH'),
        task('marketing-3', 'Have 10 direct sales or partnership conversations each week.', 'HIGH'),
        task('marketing-4', 'Partner with three complementary local businesses or creators.', 'MEDIUM'),
        task('marketing-5', 'Review cost per qualified enquiry and conversion every Friday.', 'HIGH'),
        task('marketing-6', 'Ask every satisfied customer for a referral and a short testimonial with permission.', 'MEDIUM'),
      ],
    },
    {
      key: 'growth',
      title: 'Growth',
      summary: `Work toward your goal: ${goals}. Fix retention before scaling acquisition.`,
      timeline: 'Months 3–6',
      tasks: [
        task('growth-1', 'Measure repeat purchase or retention over 60–90 days and fix the biggest reason customers leave.', 'HIGH'),
        task('growth-2', 'Improve gross margin by renegotiating suppliers, adjusting the mix or raising prices selectively.', 'HIGH'),
        task('growth-3', 'Document the delivery process well enough to train someone else.', 'MEDIUM'),
        task('growth-4', `Reinvest part of monthly profit; keep at least ${money(reserve)} as an operating reserve.`, 'HIGH'),
        task('growth-5', `Add one adjacent offer only after the core ${domain.label} offer is consistently delivered.`, 'MEDIUM'),
        task('growth-6', `Review progress against your goal (${goals}) monthly and write down what changed.`, 'MEDIUM'),
      ],
    },
  ];

  return {
    title: `${idea.slice(0, 80)} — business roadmap`,
    idea,
    budget,
    location,
    skills,
    timeAvailable,
    goals,
    stages,
    progress: 0,
    summary: `A six-stage plan for ${location}, using a budget of ${money(budget)} and ${timeAvailable}. It starts with customer evidence, adds only the registrations you need, and delays heavy spending until demand is tested.`,
    budgetPlan: [
      { label: 'Research and validation', amount: researchBudget, note: 'Customer conversations, samples, small tests' },
      { label: 'Setup and equipment', amount: setupBudget, note: 'Keep deposits and long leases minimal' },
      { label: 'Initial stock or materials', amount: stockBudget, note: 'Buy small quantities; verify quality first' },
      { label: 'Launch marketing', amount: marketingBudget, note: 'Time-boxed tests with a clear success measure' },
      { label: 'Reserve', amount: reserve, note: 'Returns, delays, repairs and slow months' },
    ],
    reference: reference
      ? { slug: reference.slug, title: reference.title, startingCostMin: reference.startingCostMin, startingCostMax: reference.startingCostMax }
      : null,
    source: 'RULE_BASED',
    disclaimer: DISCLAIMER,
  };
}

export function calculateProgress(stages) {
  const tasks = stages.flatMap((stage) => stage.tasks || []);
  if (!tasks.length) return 0;
  const done = tasks.filter((item) => item.done).length;
  return Math.round((done / tasks.length) * 100);
}
