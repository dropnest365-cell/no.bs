export type Mode = 'ONLINE' | 'OFFLINE';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  bio?: string;
  city?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  mode: Mode | 'BOTH';
  icon?: string;
  ideaCount?: number;
}

export interface IdeaCard {
  id: string;
  slug: string;
  title: string;
  summary: string;
  mode: Mode;
  difficulty: Difficulty;
  startingCostMin: number;
  startingCostMax: number;
  timeCommitment: string;
  featured: boolean;
  category: { slug: string; name: string } | null;
  bookmarked?: boolean;
  published?: boolean;
  updatedAt?: string;
}

export interface ResourceLink {
  label: string;
  url: string;
  note?: string;
}

export interface Idea extends IdeaCard {
  description: string;
  skills: string[];
  equipment: string[];
  recurringExpenses: string[];
  revenueStreams: string[];
  targetCustomers: string;
  competition: string;
  steps: string[];
  marketing: string[];
  risks: string[];
  legal: string[];
  resources: ResourceLink[];
  sources: ResourceLink[];
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  url: string;
  pricing: 'FREE' | 'FREEMIUM' | 'PAID' | 'UNKNOWN';
  lastVerifiedAt: string;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: boolean;
  isCommunity: boolean;
  lastVerifiedAt: string;
  sources: ResourceLink[];
  body?: string;
  updatedAt?: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  done: boolean;
}

export interface RoadmapStage {
  key: string;
  title: string;
  summary: string;
  timeline: string;
  tasks: RoadmapTask[];
}

export interface BudgetLine {
  label: string;
  amount: number;
  note: string;
}

export interface Roadmap {
  id?: string;
  title: string;
  idea: string;
  budget: number;
  location: string;
  skills: string;
  timeAvailable: string;
  goals: string;
  stages: RoadmapStage[];
  progress: number;
  summary?: string;
  budgetPlan?: BudgetLine[];
  reference?: { slug: string; title: string; startingCostMin: number; startingCostMax: number } | null;
  disclaimer?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Analysis {
  summary: string;
  targetMarket: string;
  customerProblem: string;
  targetAudience: string;
  competition: string;
  startupRequirements: string[];
  revenueModels: string[];
  risks: string[];
  advantages: string[];
  disadvantages: string[];
  skillsNeeded: string[];
  improvements: string[];
  firstSteps: string[];
  verdict: string;
  estimatedStartupCost: { min: number; max: number; note: string } | null;
  budgetCheck: string | null;
  relatedIdeas: Array<Pick<IdeaCard, 'slug' | 'title' | 'summary' | 'mode' | 'startingCostMin' | 'startingCostMax'>>;
  source: 'AI' | 'RULE_BASED';
  disclaimer: string;
}

export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  source: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  lastMessage?: string;
  updatedAt: string;
  createdAt?: string;
}

export interface Draft {
  id: string;
  type: string;
  title: string;
  body: string;
  source: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerNote?: string;
  user?: { name: string; email: string } | null;
  userId?: string | null;
  createdAt: string;
  reviewedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  handled: boolean;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  ideas: number;
  publishedIdeas: number;
  guides: number;
  tools: number;
  roadmaps: number;
  bookmarks: number;
  conversations: number;
  pendingDrafts: number;
  unreadContacts: number;
}

export interface AdminCategory extends Category {
  sortOrder: number;
}

export interface AiStatus {
  enabled: boolean;
  mode: 'ai' | 'rule-based';
  provider: string | null;
  model: string | null;
  note: string;
}
