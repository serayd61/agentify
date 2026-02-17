import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type RouteContext = { params: { agentId: string } } | { params: Promise<{ agentId: string }> };

async function getAgentId(context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return params.agentId;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const agentId = await getAgentId(context);
  const supabase = createServerClient();

  const { data: agent } = await supabase
    .from("agents")
    .select("id, name, status, config, sectors(name_de), packages(name_de)")
    .eq("id", agentId)
    .maybeSingle();

  if (!agent) {
    return new NextResponse("Agent widget not found", { status: 404 });
  }

  type AgentContentRow = {
    content_type: string;
    content_value_de: string | null;
  };

  const { data: contentsRaw } = await supabase
    .from("agent_content")
    .select("content_type, content_value_de")
    .eq("agent_id", agentId);
  const contents = contentsRaw as AgentContentRow[] | null;

  const servicesText = contents?.find((row) => row.content_type === "services")?.content_value_de || "";
  const faqText = contents?.find((row) => row.content_type === "faqs")?.content_value_de || "";

  const services = servicesText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  const faqs = faqText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  const payload = {
    agentId: agent.id,
    agentName: agent.name,
    status: agent.status,
    sector: agent.sectors?.[0]?.name_de || "",
    package: agent.packages?.[0]?.name_de || "",
    services,
    faqs,
  };

  const widgetId = `agentify-widget-${agentId}`;
  const css = `
    #${widgetId} { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999; font-family: Inter, system-ui, sans-serif; }
    #${widgetId} .agentify-widget-bubble { background: linear-gradient(135deg, #ff6b53, #ff3b30 70%); color: white; border: none; padding: 0.9rem 1.2rem; border-radius: 999px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3); cursor: pointer; }
    #${widgetId} .agentify-widget-panel { width: min(360px, 90vw); background: #05050a; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 1.5rem; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4); padding: 1.5rem; margin-bottom: 0.75rem; opacity: 0; transform: translateY(20px) scale(0.95); pointer-events: none; transition: all 0.3s ease; backdrop-filter: blur(20px); }
    #${widgetId} .agentify-widget-panel.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    #${widgetId} .agentify-widget-panel header { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; margin-bottom: 1rem; }
    #${widgetId} .agentify-widget-panel h2 { margin: 0; font-size: 1.4rem; line-height: 1.3; }
    #${widgetId} .agentify-widget-panel p.subtitle { margin: 0; font-size: 0.85rem; color: rgba(255, 255, 255, 0.55); }
    #${widgetId} .agentify-widget-section { margin-bottom: 1rem; }
    #${widgetId} .agentify-widget-section ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; }
    #${widgetId} .agentify-widget-section li { font-size: 0.95rem; color: rgba(255, 255, 255, 0.8); }
    #${widgetId} .agentify-widget-placeholder { margin-top: 0.5rem; padding: 0.8rem 1rem; border-radius: 1rem; background: rgba(255, 255, 255, 0.03); font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); }
    #${widgetId} .agentify-widget-faq p { margin: 0.25rem 0; font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); }
    @media (max-width: 768px) { #${widgetId} { right: 1rem; bottom: 1rem; } }
  `;

  const script = `(() => {
    const data = ${JSON.stringify(payload)};
    const widgetId = "${widgetId}";
    if (!document || document.getElementById(widgetId)) return;
    const style = document.createElement("style");
    style.textContent = ${JSON.stringify(css)};
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.id = widgetId;

    const panel = document.createElement("div");
    panel.className = "agentify-widget-panel";

    const header = document.createElement("header");
    const title = document.createElement("h2");
    title.textContent = data.agentName || "Agent";
    const subtitle = document.createElement("p");
    subtitle.className = "subtitle";
    subtitle.textContent = (data.sector || "Branche") + " · " + (data.package || "Paket");

    header.appendChild(title);
    header.appendChild(subtitle);

    const serviceSection = document.createElement("div");
    serviceSection.className = "agentify-widget-section";
    const serviceTitle = document.createElement("h3");
    serviceTitle.textContent = "Services";
    const serviceList = document.createElement("ul");
    (data.services || []).forEach((service) => {
      const item = document.createElement("li");
      item.textContent = service;
      serviceList.appendChild(item);
    });
    serviceSection.appendChild(serviceTitle);
    serviceSection.appendChild(serviceList);

    const faqSection = document.createElement("div");
    faqSection.className = "agentify-widget-section agentify-widget-faq";
    const faqHeading = document.createElement("h3");
    faqHeading.textContent = "FAQ";
    faqSection.appendChild(faqHeading);
    (data.faqs || []).forEach((faq) => {
      const faqItem = document.createElement("p");
      faqItem.textContent = faq;
      faqSection.appendChild(faqItem);
    });

    const placeholder = document.createElement("div");
    placeholder.className = "agentify-widget-placeholder";
    placeholder.textContent = "Placeholder für Live-Chat. Bald verfügbar.";

    panel.appendChild(header);
    panel.appendChild(serviceSection);
    if ((data.faqs || []).length) {
      panel.appendChild(faqSection);
    }
    panel.appendChild(placeholder);

    const bubble = document.createElement("button");
    bubble.className = "agentify-widget-bubble";
    bubble.textContent = "Chat mit " + (data.agentName || "Agent");
    bubble.addEventListener("click", () => {
      panel.classList.toggle("open");
    });

    container.appendChild(panel);
    container.appendChild(bubble);
    document.body.appendChild(container);
  })();`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=0, s-maxage=60",
    },
  });
}
