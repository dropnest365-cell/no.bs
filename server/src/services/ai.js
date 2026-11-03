import { config, isAiConfigured } from '../config.js';

const REQUEST_TIMEOUT_MS = 30_000;

export function aiStatus() {
  return {
    enabled: isAiConfigured(),
    mode: isAiConfigured() ? 'ai' : 'rule-based',
    provider: isAiConfigured() ? config.ai.provider : null,
    model: isAiConfigured() ? config.ai.model : null,
    note: isAiConfigured()
      ? 'A configured AI provider is used for mentor and analyzer responses. AI output still requires verification.'
      : 'No AI provider is configured. NO BS is using its built-in rule-based guidance, which is deterministic and does not send your questions to a third party.',
  };
}

const SYSTEM_PROMPT = `You are the NO BS business mentor for people in India. You give practical, honest, specific guidance about starting and growing small businesses and side hustles.

Non-negotiable rules:
- Never guarantee income, profit, rankings, approvals, customers or business success.
- Never invent statistics, government fees, tax thresholds, schemes, URLs or sources.
- Use INR (₹) for money and assume the user is in India unless they say otherwise.
- Where rules or fees matter, tell the user to verify on the relevant official portal (GST, MCA, Udyam, FSSAI, Startup India, Income Tax).
- Prefer concrete next actions over motivational filler.
- Be concise but useful. Use short Markdown headings, bullets and numbered steps.
- If the question is outside business guidance (medical, legal, investment advice), say what you can and cannot help with.
- End with a short note that this is general guidance, not verified professional advice, when the answer includes legal, tax, health or financial claims.
- Never claim that your answer has been reviewed or verified.`;

async function callAI(messages, options = {}) {
  if (!isAiConfigured()) throw new Error('AI provider is not configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${config.ai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.ai.model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 1200,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[ai] Provider returned ${response.status}: ${text.slice(0, 300)}`);
      throw new Error('AI provider request failed');
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('AI provider returned an empty response');
    return content.trim();
  } finally {
    clearTimeout(timer);
  }
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('No JSON object found');
  return JSON.parse(candidate.slice(start, end + 1));
}

function stringArray(value, fallback = [], max = 12) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim().slice(0, 500))
    .slice(0, max);
  return cleaned.length ? cleaned : fallback;
}

export async function aiMentorReply(question, contextText) {
  const reply = await callAI(
    [
      {
        role: 'user',
        content: `Context from the NO BS library (use only if relevant; do not invent extra facts):\n${contextText}\n\nUser question: ${question}`,
      },
    ],
    { temperature: 0.4, maxTokens: 1100 },
  );
  return reply;
}

export async function aiAnalyzeIdea(ideaText, contextText, budget, location) {
  const content = await callAI(
    [
      {
        role: 'user',
        content: `Analyse this early-stage business idea for the Indian market.\nIdea: ${ideaText}\nBudget: ${budget ? `INR ${budget}` : 'not stated'}\nLocation: ${location || 'not stated'}\nReference ideas from the library (optional context): ${contextText}\n\nReturn ONLY valid JSON with this shape:\n{\n  "summary": "2-3 sentence honest assessment",\n  "targetMarket": "string",\n  "customerProblem": "string",\n  "targetAudience": "string",\n  "competition": "string",\n  "startupRequirements": ["..."],\n  "revenueModels": ["..."],\n  "risks": ["..."],\n  "advantages": ["..."],\n  "disadvantages": ["..."],\n  "skillsNeeded": ["..."],\n  "improvements": ["..."],\n  "firstSteps": ["..."],\n  "verdict": "One cautious sentence. Never guarantee success."\n}\nDo not include invented market-size statistics or fake sources.`,
      },
    ],
    { temperature: 0.35, maxTokens: 1600 },
  );

  const data = extractJson(content);
  if (typeof data !== 'object' || !data) throw new Error('Invalid AI analysis');

  const text = (value, fallback) =>
    typeof value === 'string' && value.trim() ? value.trim().slice(0, 2000) : fallback;

  return {
    summary: text(data.summary, 'Structured analysis generated by the configured AI provider. Verify important claims independently.'),
    targetMarket: text(data.targetMarket, 'Define a specific customer segment before spending money.'),
    customerProblem: text(data.customerProblem, 'State the problem in the customer own words after speaking with them.'),
    targetAudience: text(data.targetAudience, 'Start with one narrow audience you can reach affordably.'),
    competition: text(data.competition, 'List direct competitors, informal alternatives and the option of doing nothing.'),
    startupRequirements: stringArray(data.startupRequirements, ['A written scope and a small test budget'], 12),
    revenueModels: stringArray(data.revenueModels, ['Direct sales', 'Service or maintenance fees'], 10),
    risks: stringArray(data.risks, ['Demand may be lower than expected', 'Costs may be higher than estimated'], 10),
    advantages: stringArray(data.advantages, ['Can be tested at a small scale'], 8),
    disadvantages: stringArray(data.disadvantages, ['Requires customer acquisition work'], 8),
    skillsNeeded: stringArray(data.skillsNeeded, ['Sales and customer research'], 10),
    improvements: stringArray(data.improvements, ['Interview 10 potential customers before building'], 10),
    firstSteps: stringArray(data.firstSteps, ['Write a one-page test plan with a spending cap'], 8),
    verdict: text(data.verdict, 'This analysis is a starting point, not a prediction. Test demand with real customers.'),
    estimatedStartupCost: null,
    relatedIdeas: [],
    source: 'AI',
  };
}
