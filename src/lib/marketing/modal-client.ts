/**
 * Modal webhook client
 * Calls the deployed AJAN SISTEMLERI orchestration endpoints
 * Base URL: https://nick-90891--claude-orchestrator-directive.modal.run
 */

export const MODAL_BASE_URL =
  process.env.MODAL_BASE_URL ||
  "https://nick-90891--claude-orchestrator-directive.modal.run";

export type ModalSlug = "create-proposal" | "instantly-autoreply";

export interface ModalRequest {
  slug: ModalSlug;
  data: Record<string, unknown>;
}

export interface ModalResponse {
  status: "success" | "error";
  slug: string;
  mode?: "procedural" | "agentic";
  result?: Record<string, unknown>;
  response?: string;
  usage?: { input_tokens: number; output_tokens: number; turns: number };
  timestamp?: string;
  error?: string;
}

const TIMEOUT_MS: Record<ModalSlug, number> = {
  "create-proposal": 120_000,   // 2 minutes — PandaDoc creation
  "instantly-autoreply": 60_000, // 1 minute — Claude reply generation
};

export async function callModalWebhook(req: ModalRequest): Promise<ModalResponse> {
  const url = `${MODAL_BASE_URL}/d/${req.slug}`;
  const timeoutMs = TIMEOUT_MS[req.slug] ?? 60_000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: req.data }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Modal ${req.slug} HTTP ${response.status}: ${text}`);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Modal ${req.slug} timed out after ${timeoutMs / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
