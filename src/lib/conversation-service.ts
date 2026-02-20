import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ConversationRow {
  id: string;
  messages?: Message[];
  extracted_data?: Record<string, unknown>;
  message_count?: number;
  started_at?: string;
  duration_seconds?: number;
  outcome?: string;
  status?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ConversationData {
  agentId: string;
  customerId: string;
  visitorId: string;
  visitorInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    device?: string;
    browser?: string;
    city?: string;
    country?: string;
    ip?: string;
  };
}

export async function startConversation(data: ConversationData): Promise<string> {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      agent_id: data.agentId,
      customer_id: data.customerId,
      visitor_id: data.visitorId,
      visitor_name: data.visitorInfo?.name,
      visitor_email: data.visitorInfo?.email,
      visitor_phone: data.visitorInfo?.phone,
      visitor_device: data.visitorInfo?.device,
      visitor_browser: data.visitorInfo?.browser,
      visitor_city: data.visitorInfo?.city,
      visitor_country: data.visitorInfo?.country,
      visitor_ip: data.visitorInfo?.ip,
      messages: [],
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Start conversation error:", error);
    throw error;
  }

  return conversation.id;
}

export async function addMessage(
  conversationId: string,
  message: Message,
  extractedData?: Record<string, unknown>
): Promise<void> {
  const { data: conv } = await supabase
    .from("conversations")
    .select<ConversationRow>("messages, extracted_data, message_count")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv) return;

  const updatedMessages = [...(conv.messages || []), message];
  const newExtractedData = {
    ...(conv.extracted_data || {}),
    ...(extractedData || {}),
  };

  const updates: Record<string, unknown> = {
    messages: updatedMessages,
    message_count: updatedMessages.length,
    extracted_data: newExtractedData,
    updated_at: new Date().toISOString(),
  };

  if (extractedData?.visitorName) updates.visitor_name = extractedData.visitorName;
  if (extractedData?.visitorEmail) updates.visitor_email = extractedData.visitorEmail;
  if (extractedData?.visitorPhone) updates.visitor_phone = extractedData.visitorPhone;
  if (extractedData?.intent) updates.intent = extractedData.intent;
  if (extractedData?.sentiment) updates.sentiment = extractedData.sentiment;
  if (extractedData?.topic) {
    updates.topics = Array.isArray(extractedData.topic) ? extractedData.topic : [extractedData.topic];
  }

  await supabase.from("conversations").update(updates).eq("id", conversationId);
}

export async function endConversation(conversationId: string, outcome: string = "none"): Promise<void> {
  const { data: conv } = await supabase
    .from("conversations")
    .select<ConversationRow>("started_at")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv) return;

  const endedAt = new Date();
  const startedAt = new Date(conv.started_at);
  const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

  await supabase
    .from("conversations")
    .update({
      status: "ended",
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
      outcome,
    })
    .eq("id", conversationId);
}

export async function getConversations(
  customerId: string,
  options?: { agentId?: string; status?: string; limit?: number; offset?: number }
): Promise<ConversationRow[]> {
  let query = supabase
    .from("conversations")
    .select<ConversationRow>("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (options?.agentId) query = query.eq("agent_id", options.agentId);
  if (options?.status) query = query.eq("status", options.status);
  if (options?.limit) {
    const start = options.offset ?? 0;
    query = query.range(start, start + options.limit - 1);
  } else if (options?.offset) {
    query = query.range(options.offset, options.offset + 9);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Get conversations error:", error);
    return [];
  }
  return data || [];
}

export async function getActiveConversations(customerId: string): Promise<ConversationRow[]> {
  const { data } = await supabase
    .from("conversations")
    .select<ConversationRow>("*")
    .eq("customer_id", customerId)
    .eq("status", "active")
    .order("updated_at", { ascending: false });
  return data || [];
}

export interface ConversationStats {
  total: number;
  leads: number;
  appointments: number;
  conversionRate: number;
  avgDuration: number;
  avgMessages: number;
}

export async function getConversationStats(customerId: string, days: number = 7): Promise<ConversationStats | null> {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const { data: conversations } = await supabase
    .from("conversations")
    .select<ConversationRow>("*")
    .eq("customer_id", customerId)
    .gte("created_at", fromDate.toISOString());

  if (!conversations) return null;

  const total = conversations.length;
  const leads = conversations.filter((c) => c.outcome === "lead_created").length;
  const appointments = conversations.filter((c) => c.outcome === "appointment_booked").length;
  const avgDuration = total > 0 ? conversations.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / total : 0;
  const avgMessages = total > 0 ? conversations.reduce((sum, c) => sum + (c.message_count || 0), 0) / total : 0;

  return {
    total,
    leads,
    appointments,
    conversionRate: total > 0 ? ((leads + appointments) / total) * 100 : 0,
    avgDuration: Math.round(avgDuration),
    avgMessages: Math.round(avgMessages),
  };
}
