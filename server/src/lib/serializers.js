export function parseJson(value, fallback = []) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function serializeIdeaCard(idea, extra = {}) {
  return {
    id: idea.id,
    slug: idea.slug,
    title: idea.title,
    summary: idea.summary,
    mode: idea.mode,
    difficulty: idea.difficulty,
    startingCostMin: idea.startingCostMin,
    startingCostMax: idea.startingCostMax,
    timeCommitment: idea.timeCommitment,
    featured: idea.featured,
    category: idea.category ? { slug: idea.category.slug, name: idea.category.name } : null,
    ...extra,
  };
}

export function serializeIdea(idea, extra = {}) {
  return {
    ...serializeIdeaCard(idea),
    description: idea.description,
    skills: parseJson(idea.skills),
    equipment: parseJson(idea.equipment),
    recurringExpenses: parseJson(idea.recurringExpenses),
    revenueStreams: parseJson(idea.revenueStreams),
    targetCustomers: idea.targetCustomers,
    competition: idea.competition,
    steps: parseJson(idea.steps),
    marketing: parseJson(idea.marketing),
    risks: parseJson(idea.risks),
    legal: parseJson(idea.legal),
    resources: parseJson(idea.resources),
    sources: parseJson(idea.sources),
    published: idea.published,
    lastVerifiedAt: idea.lastVerifiedAt,
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
    ...extra,
  };
}

export function serializeGuide(guide, extra = {}) {
  return {
    id: guide.id,
    slug: guide.slug,
    title: guide.title,
    excerpt: guide.excerpt,
    category: guide.category,
    published: guide.published,
    isCommunity: guide.isCommunity,
    lastVerifiedAt: guide.lastVerifiedAt,
    sources: parseJson(guide.sources),
    createdAt: guide.createdAt,
    updatedAt: guide.updatedAt,
    ...extra,
  };
}

export function serializeFullGuide(guide, extra = {}) {
  return { ...serializeGuide(guide), body: guide.body, ...extra };
}

export function serializeTool(tool) {
  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    url: tool.url,
    pricing: tool.pricing,
    published: tool.published,
    lastVerifiedAt: tool.lastVerifiedAt,
  };
}

export function serializeRoadmap(roadmap) {
  return {
    id: roadmap.id,
    title: roadmap.title,
    idea: roadmap.idea,
    budget: roadmap.budget,
    location: roadmap.location,
    skills: roadmap.skills,
    timeAvailable: roadmap.timeAvailable,
    goals: roadmap.goals,
    stages: parseJson(roadmap.stages),
    progress: roadmap.progress,
    createdAt: roadmap.createdAt,
    updatedAt: roadmap.updatedAt,
  };
}

export function serializeDraft(draft) {
  return {
    id: draft.id,
    type: draft.type,
    title: draft.title,
    body: draft.body,
    source: draft.source,
    status: draft.status,
    reviewerNote: draft.reviewerNote,
    userId: draft.userId,
    user: draft.user ? { name: draft.user.name, email: draft.user.email } : null,
    createdAt: draft.createdAt,
    reviewedAt: draft.reviewedAt,
  };
}
