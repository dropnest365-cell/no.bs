import { findRelevantIdeas, inferDomain } from './discovery.js';

const INTENTS = [
  {
    key: 'registration',
    keywords: ['register', 'registration', 'gst', 'udyam', 'company', 'llp', 'proprietorship', 'incorporate', 'licence', 'license', 'fssai', 'tax'],
  },
  {
    key: 'customers',
    keywords: ['customer', 'customers', 'client', 'clients', 'find buyers', 'first sale', 'leads', 'enquiries', 'inquiries'],
  },
  {
    key: 'marketing',
    keywords: ['marketing', 'advertise', 'advertising', 'instagram', 'social media', 'seo', 'promote', 'promotion', 'ads', 'content'],
  },
  {
    key: 'pricing',
    keywords: ['price', 'pricing', 'charge', 'charging', 'rate', 'how much', 'margin', 'discount'],
  },
  {
    key: 'budget',
    keywords: ['budget', 'cost', 'costs', 'cheap', 'money needed', 'investment', 'capital', 'expenses', 'runway'],
  },
  {
    key: 'choose',
    keywords: ['choose', 'choose between', 'which business', 'which idea', 'compare', 'decide between', 'better idea'],
  },
  {
    key: 'validate',
    keywords: ['validate', 'validation', 'test idea', 'research', 'demand', 'will people buy', 'proof'],
  },
  {
    key: 'grow',
    keywords: ['grow', 'growth', 'scale', 'scaling', 'more customers', 'expand', 'increase sales'],
  },
  {
    key: 'registration_food',
    keywords: ['fssai', 'food licence', 'food license', 'restaurant licence', 'kitchen licence'],
  },
];

function detectIntent(question) {
  const text = question.toLowerCase();
  const found = [];
  for (const intent of INTENTS) {
    if (intent.keywords.some((keyword) => text.includes(keyword))) found.push(intent.key);
  }
  return found;
}

function ideaLinks(ideas) {
  if (!ideas.length) return '';
  return `\n\n**Relevant NO BS guides**\n${ideas.map((idea) => `- [${idea.title}](/ideas/${idea.slug}) — ${idea.summary}`).join('\n')}`;
}

function registrationAnswer(ideas) {
  return `**Registration is a checklist, not a single certificate.** Add items only when they apply to your activity.

1. **Choose a structure.** A sole proprietorship is simplest for one-person service businesses. A partnership needs a written deed. An LLP or private limited company is a separate legal entity with more compliance. Pick based on liability, partners, investors and client requirements — not prestige.
2. **PAN, bank account and business proof.** Open a current account in the business name and keep personal and business money separate from day one.
3. **Udyam (MSME) registration.** Useful for many small businesses and free on the official portal. It is not a loan guarantee and does not replace GST or sector licences.
4. **GST.** Registration depends on turnover, state and the nature of your supplies. Do not trust a number from an old article; check the GST portal or ask a chartered accountant.
5. **Local and sector permissions.** Shops and Establishments is state-specific. Food needs FSSAI through FoSCoS. Manufacturing or waste-related work may need pollution control consent. Transport, health and education have their own rules.

**Practical sequence:** validate the business → open a separate bank account → add Udyam/GST when required → incorporate only when a contract, investor or liability situation demands it.

Use official portals only: [MCA](https://www.mca.gov.in/), [Udyam](https://udyamregistration.gov.in/), [GST](https://www.gst.gov.in/), [FSSAI](https://fssai.gov.in/). Avoid agents who charge for free registrations or promise approvals.${ideaLinks(ideas.slice(0, 2))}

This is general information, not legal or tax advice. Rules and fees change; verify before filing.`;
}

function customersAnswer(ideas) {
  return `**Finding the first 10 customers is a sales problem, not a branding problem.** Do this in order:

1. **Write one sentence about who you help and with what.** "I help [specific customer] solve [specific problem] for [price range]." If it is vague, your outreach will be vague.
2. **List 50 named prospects.** Local businesses, community members, past colleagues, people who already pay for an alternative. Not "everyone".
3. **Make direct contact.** A short, specific message that shows you looked at their situation. No mass copy-paste. Aim for 10 genuine conversations per week.
4. **Offer a low-risk first step.** A paid trial, a small project, a diagnostic session or a sample — not a huge commitment.
5. **Ask for the sale clearly.** State the price, what is included and when it starts. Silence is not a sales strategy.
6. **Track every conversation.** A simple sheet with name, need, next step and follow-up date beats a fancy CRM at this stage.
7. **Ask for referrals after delivery.** "Who else in your network has this problem?" is more effective than another social post.

**Channels by business type:** local service → Google Business Profile, apartment groups, nearby offices; B2B service → direct outreach and referrals; product → marketplace search, niche communities and small ad tests; content → search-driven topics and an email list.

Do not buy follower counts or send unsolicited bulk WhatsApp messages. Focus on a small number of real conversations.${ideaLinks(ideas.slice(0, 3))}`;
}

function marketingAnswer(ideas) {
  return `**Pick one channel, one audience and one offer for the next 60 days.** Spreading across five platforms usually produces five half-efforts.

**A workable weekly rhythm**
- 1 useful piece of long-form content (article, video or carousel) that answers a real customer question.
- 3 short posts derived from it, each with one clear takeaway.
- 5 direct conversations with potential customers or partners.
- 1 review of enquiries, sources and spend. Double down on what produced conversations, not just likes.

**Choose the channel based on buying behaviour**
- Local services: Google Business Profile, local search, apartment and office partnerships.
- B2B services: LinkedIn, direct outreach, referrals, case studies.
- Products: marketplace search, product-led short video, small paid tests.
- Education: YouTube/search for intent, free workshops, email list.

**Make proof easy to find.** Show the process, a real before-and-after, a customer quote with permission, and a clear next step. Do not invent testimonials or statistics.

**Measure three things:** qualified enquiries, cost per enquiry, and conversion to paid work. Reach and followers are supporting metrics, not the goal.

If you share your business type and budget, I can suggest a more specific first channel.${ideaLinks(ideas.slice(0, 2))}`;
}

function pricingAnswer(ideas) {
  return `**Price in three layers so you do not guess.**

**1. Cost floor**
Add your monthly personal need, business expenses, tax reserve and a buffer for slow months. Divide by the billable hours you can realistically sell — not the hours you sit at a desk. That gives your minimum hourly rate. For a project, multiply estimated hours by that rate and add 20–30% for revisions and admin.

**2. Market range**
Look at three to five comparable providers. Compare deliverables, not just the headline price. If you are far cheaper, buyers may doubt quality; if you are far higher, you need a clear reason.

**3. Value**
When the outcome has a measurable business impact, you can price against that value. Stay conservative and never guarantee a result you cannot evidence.

**Example (illustrative, not a recommendation):** if you need ₹60,000 a month, have ₹15,000 in business costs and can bill 60 hours, your floor is about ₹1,250/hour before tax. A 10-hour project needs at least ₹12,500 plus a contingency.

**Protect the price:** take an advance, define revision rounds, charge for extra scope and put payment dates in writing. Discount by removing scope, not by lowering your rate for the same work.

Use the [Pricing Calculator](/tools/pricing-calculator) to test a product price with costs and target margin.${ideaLinks(ideas.slice(0, 1))}`;
}

function budgetAnswer(ideas) {
  const costs = ideas[0]
    ? `For **${ideas[0].title}**, the library estimates a starting range of ₹${ideas[0].startingCostMin.toLocaleString('en-IN')}–₹${ideas[0].startingCostMax.toLocaleString('en-IN')}. That is a planning range, not a quote.`
    : 'Start with the smallest test that can produce real evidence.';
  return `**Keep fixed costs low until demand is proven.** ${costs}

**Budget categories to plan**
- Setup: equipment, deposits, licences, initial stock.
- Monthly fixed: rent, salaries, software, internet, loan repayments.
- Variable: materials, packaging, delivery, payment fees, commissions.
- Marketing: a capped test budget, not an open-ended spend.
- Contingency: at least 10–20% for delays, returns and mistakes.
- Personal runway: how you will live while the business stabilises.

**Rules that prevent common failures**
1. Do not spend the full budget before the first paying customer.
2. Separate business and personal accounts.
3. Keep three months of fixed costs where possible.
4. Test one channel and one offer before expanding.
5. Track actual spend weekly against the plan.
6. Avoid loans for unvalidated demand; if borrowing, understand the total cost and repayment.

Use the [Startup Cost Calculator](/tools/startup-cost-calculator) and [Profit Calculator](/tools/profit-calculator) to model scenarios. Every output is an estimate.${ideaLinks(ideas.slice(0, 2))}`;
}

function chooseAnswer(ideas) {
  const matches = ideas.length
    ? `From the library, these look closest to what you described:\n${ideas.map((idea) => `- [${idea.title}](/ideas/${idea.slug})`).join('\n')}`
    : 'Tell me your budget, available hours, location and skills, and I can narrow the library.';
  return `**Do not choose the idea that sounds most exciting. Score the ones you can actually execute.**

Use five criteria, scored 1–5:
1. **Demand evidence** — have you spoken to people who already pay for a solution?
2. **Affordability** — can you fund the test without borrowing dangerously?
3. **Skill fit** — can you deliver the core work, or do you have a credible partner?
4. **Time fit** — does it fit your real weekly availability for at least six months?
5. **Access to customers** — can you reach 50 prospects without a large ad budget?

Then apply two filters:
- **Disqualifiers:** legal or licensing barriers you cannot meet, products you cannot support, or a business that requires full-time hours when you only have ten.
- **Test cost:** prefer the idea you can test for the least money in two to four weeks.

**A useful tie-breaker:** choose the idea where you can get a paying pilot customer fastest. Revenue is better evidence than another month of planning.

${matches}

If you reply with your budget, city, skills and hours per week, I will give you a short comparison and a first test plan.`;
}

function validateAnswer(ideas) {
  return `**Validation means evidence that someone will pay — not encouragement from friends.**

1. **Write the idea as one sentence:** for [customer], who struggles with [problem], we provide [outcome] at [price], through [channel].
2. **Talk to 10 potential customers.** Ask what they did last time the problem occurred, what it cost, what alternatives they tried and who decides the purchase. Do not pitch.
3. **Study alternatives:** direct competitors, informal workarounds and doing nothing. Read negative reviews; they reveal unmet needs.
4. **Run a small paid test.** Pre-sell a batch, run a paid pilot, book a stall or spend a capped amount on ads with a clear success measure.
5. **Calculate unit economics.** Revenue minus direct costs, delivery, fees, returns and your time. If one sale loses money, more sales will not fix it.
6. **Set a stop rule.** Decide in advance what result means continue, change or stop. Write it down.
7. **Look for a pattern.** One enthusiastic customer is an anecdote. Ten similar conversations are a signal.

**Do not:** invent market-size numbers, treat likes as demand, or spend on branding before a paying customer.${ideaLinks(ideas.slice(0, 3))}`;
}

function growAnswer(ideas) {
  return `**Growth usually comes from existing customers before new ones.**

1. **Measure retention.** How many customers buy again within 60–90 days? If it is low, fix delivery and follow-up before increasing ad spend.
2. **Ask for referrals deliberately.** After a good outcome, ask one specific question: "Who else do you know with this problem?" Make it easy to forward your details.
3. **Add one adjacent offer.** A maintenance plan, a bundle, a faster option or a training session. Do not add a completely new business.
4. **Raise prices selectively.** If demand exceeds capacity and reviews are strong, increase prices for new customers first.
5. **Document the process.** A repeatable checklist lets you delegate or hire without quality collapsing.
6. **Build a direct audience.** An email list or WhatsApp opt-in reduces dependence on a platform.
7. **Watch cash, not just revenue.** Growth consumes working capital: inventory, salaries and credit terms can sink a profitable business.

**Hiring check:** only add a person when the work is documented, the demand is stable and you can cover at least three months of their cost.${ideaLinks(ideas.slice(0, 2))}`;
}

function foodAnswer(ideas) {
  return `**Food businesses need licensing and hygiene before scale.**

1. **FSSAI category.** Basic Registration, State Licence or Central Licence depends on turnover and activity. Categories and thresholds change; check FSSAI and FoSCoS.
2. **Apply through FoSCoS.** Keep identity, address, premises, product and water-test details ready. Fees depend on category.
3. **Local permissions.** Municipal trade licence, shops and establishments registration, fire clearance and waste arrangements may apply. Check your municipal corporation.
4. **Hygiene systems.** Train staff, separate raw and cooked food, control temperatures, label allergens and keep cleaning records.
5. **Cost honestly.** Include packaging, delivery, commissions, wastage and your own time in every dish.
6. **Test small.** A limited menu and 20 real customers will teach you more than a large launch.

Use official sources: [FSSAI](https://fssai.gov.in/) and [FoSCoS](https://www.foscos.fssai.gov.in/).${ideaLinks(ideas.slice(0, 2))}

This is general information, not legal advice. Local requirements vary.`;
}

function defaultAnswer(question, ideas, domain) {
  return `Here is a practical way to move forward on **${domain.label}** without wasting money.

**1. Define the customer and problem**
Write one sentence: for [specific customer], who struggles with [specific problem], you provide [outcome] at [price]. If you cannot name the customer and the problem, the next step is customer conversations, not building.

**2. Test before you build**
Talk to 10 potential customers. Ask what they currently do, what it costs them and what would make them switch. Then run the smallest paid test you can: a pilot, a pre-sale, a sample batch or a small ad with a cap.

**3. Check the money**
List setup costs, monthly fixed costs and variable costs per sale. Add 10–20% contingency. Keep at least a few months of personal runway. Use the NO BS calculators to model a low, realistic and high scenario — and treat all outputs as estimates.

**4. Get compliant for your activity**
Register the business only as needed. Food, health, transport, education and manufacturing have sector rules. Check official portals and ask a qualified professional before assuming.

**5. Get your first customers manually**
Direct outreach, referrals, local partnerships and one focused channel. Do not start with paid ads until you know the offer converts.

${ideaLinks(ideas.slice(0, 3))}

If you share your budget, city, skills and available hours, I can turn this into a more specific 30-day plan.`;
}

export function buildRuleBasedReply({ question, ideas = [] }) {
  const matches = findRelevantIdeas(ideas, question, 3);
  const domain = inferDomain(question);
  const intents = detectIntent(question);
  const text = question.toLowerCase();

  if (/^(hi|hello|hey|namaste)\b/.test(text.trim()) && question.length < 40) {
    return {
      content: `Hello. I am the NO BS business mentor. I can help you think through:

- choosing between business ideas
- validating demand before spending
- finding your first customers
- pricing a product or service
- budgeting and startup costs
- registration, GST and licensing basics
- growing an existing small business

Tell me what you are considering, your city, your rough budget and how many hours per week you have. I will give you a practical next step.

**Note:** this mentor uses rule-based guidance unless an AI provider is configured. Nothing here is verified professional advice.`,
      source: 'RULE_BASED',
    };
  }

  let content;
  if (intents.includes('registration_food')) content = foodAnswer(matches);
  else if (intents.includes('registration')) content = registrationAnswer(matches);
  else if (intents.includes('choose')) content = chooseAnswer(matches);
  else if (intents.includes('customers')) content = customersAnswer(matches);
  else if (intents.includes('pricing')) content = pricingAnswer(matches);
  else if (intents.includes('budget')) content = budgetAnswer(matches);
  else if (intents.includes('marketing')) content = marketingAnswer(matches);
  else if (intents.includes('validate')) content = validateAnswer(matches);
  else if (intents.includes('grow')) content = growAnswer(matches);
  else content = defaultAnswer(question, matches, domain);

  if (intents.includes('registration') && !/official/i.test(content)) {
    content += '\n\nVerify current requirements on official government portals before filing.';
  }

  content += `\n\n---\n_Rule-based guidance generated by NO BS. It is general information, not verified research or professional advice. Double-check tax, legal and licensing claims on official portals._`;

  return { content, source: 'RULE_BASED' };
}

export function mentorContext(ideas, guides, tools) {
  const ideaLines = ideas
    .slice(0, 8)
    .map((idea) => `- ${idea.title} (${idea.mode}, ${idea.category?.name}): ${idea.summary}`)
    .join('\n');
  const guideLines = guides.map((guide) => `- ${guide.title}: ${guide.excerpt}`).join('\n');
  const toolLines = tools.slice(0, 8).map((tool) => `- ${tool.name} (${tool.category}): ${tool.description}`).join('\n');
  return `IDEAS:\n${ideaLines}\n\nGUIDES:\n${guideLines}\n\nTOOLS:\n${toolLines}`;
}
