// ========================================
// AGENTIFY.CH Type Definitions
// ========================================

export interface AgentCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  image?: string;
  description: string;
  agentCount: number;
}

export interface AgentTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  longDescription: string;
  icon: string;
  image?: string;
  features: string[];
  useCases: string[];
  integrations: string[];
  priceMonthly: number;
  priceYearly: number;
  rating: number;
  reviewCount: number;
  userCount: number;
  isPopular: boolean;
  isNew: boolean;
  demoQuestions: string[];
}

export interface Customer {
  id: string;
  email: string;
  companyName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  industry?: string;
  createdAt: Date;
}

export interface CustomerAgent {
  id: string;
  customerId: string;
  templateId: string;
  name: string;
  status: "active" | "pending" | "suspended";
  customSettings: Record<string, unknown>;
  apiKey: string;
  embedCode: string;
  createdAt: Date;
  messageCount: number;
  messageLimit: number;
}

export interface Conversation {
  id: string;
  agentId: string;
  messages: Message[];
  visitorInfo?: VisitorInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface VisitorInfo {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
}

export interface UsageStats {
  totalMessages: number;
  totalConversations: number;
  avgResponseTime: number;
  satisfactionRate: number;
  topQuestions: { question: string; count: number }[];
}

export interface Subscription {
  id: string;
  customerId: string;
  plan: "starter" | "business" | "enterprise";
  status: "active" | "past_due" | "canceled";
  priceMonthly: number;
  currentPeriodEnd: Date;
  stripeSubscriptionId?: string;
}

export interface KnowledgeItem {
  id: string;
  agentId: string;
  type: "faq" | "document" | "price" | "info";
  question?: string;
  answer: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

