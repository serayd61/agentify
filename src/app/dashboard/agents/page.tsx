"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const supabase = createClient();

interface AgentRow {
  id: string;
  name: string;
  status: string;
  sectors: { name_de: string }[];
  packages: { name_de: string }[];
}

export default function AgentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [usageMap, setUsageMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAgentId, setCopiedAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError("Supabase client is not configured.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (!customer?.id) {
          setError("Kunde nicht gefunden.");
          setLoading(false);
          return;
        }

        const { data: agentData } = await supabase
          .from("agents")
          .select(
            "id, name, status, sectors:sectors(name_de), packages:packages(name_de)"
          )
          .eq("customer_id", customer.id);

        setAgents(agentData || []);

        const agentIds = agentData?.map((agent) => agent.id) || [];
        if (agentIds.length > 0) {
          const thisMonth = new Date().toISOString().slice(0, 7);
          const { data: usage } = await supabase
            .from("usage_stats")
            .select("agent_id, message_count")
            .in("agent_id", agentIds)
            .eq("month", thisMonth);

          const map: Record<string, number> = {};
          usage?.forEach((row) => {
            map[row.agent_id] = row.message_count;
          });
          setUsageMap(map);
        }
      } catch (err) {
        console.error(err);
        setError("Agenten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const embedSnippet = (id: string) => `<script src="https://agentify.ch/api/widget/${id}"></script>`;

  const handleCopy = async (agentId: string) => {
    const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : null;
    if (!clipboard) {
      toast({ title: "Clipboard nicht verfügbar", description: "Bitte kopiere den Code manuell.", variant: "warning" });
      return;
    }
    try {
      await clipboard.writeText(embedSnippet(agentId));
      setCopiedAgentId(agentId);
      toast({ title: "Embed kopiert", description: "Widget-Snippet wurde in die Zwischenablage kopiert.", variant: "success" });
      setTimeout(() => setCopiedAgentId(null), 2500);
    } catch (err) {
      console.error(err);
      toast({ title: "Fehler", description: "Kopieren war nicht möglich.", variant: "error" });
    }
  };

  const hasAgents = (agents?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-surface text-white">
      <Header />
      <main className="flex-1 py-12">
        <div className="container space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Dashboard</p>
              <h1 className="text-4xl font-bold">Meine Agents</h1>
              <p className="text-white/60">Verwalte deine aktiven KI-Assistenten.</p>
            </div>
            <Button className="rounded-full" variant="default" asChild>
              <Link href="/dashboard/agents/new">Neuen Agent erstellen</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#ff3b30]" />
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-card border border-white/[0.08] p-6">
              <p className="text-white/60">{error}</p>
            </div>
          ) : !hasAgents ? (
            <Card className="text-center space-y-4">
              <p className="text-sm text-white/50">Noch keine Agenten vorhanden.</p>
              <p className="text-lg font-semibold text-white">Erstelle jetzt deinen ersten Agenten.</p>
              <Button className="mx-auto rounded-full" asChild>
                <Link href="/dashboard/agents/new">Jetzt Agent erstellen</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-white">{agent.name}</h2>
                    <span className="text-xs uppercase tracking-[0.4em] text-white/50">
                      {agent.status}
                    </span>
                  </div>
                  <div className="text-sm text-white/40">
                    Sektor: {agent?.sectors?.[0]?.name_de ?? "-"}
                  </div>
                  <div className="text-sm text-white/40">
                    Paket: {agent?.packages?.[0]?.name_de ?? "-"}
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>Nachrichten (diesen Monat)</span>
                    <span>{usageMap[agent.id] ?? 0}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/agents/${agent.id}`}>Bearbeiten</Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      Pausieren
                    </Button>
                    <Button variant="ghost" size="sm">
                      Löschen
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a15]/70 p-3 text-xs font-mono text-white/70">
                    <div className="flex items-center justify-between gap-3">
                      <span className="uppercase tracking-[0.4em] text-[10px] text-white/50">Widget Embed</span>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(agent.id)}>
                        {copiedAgentId === agent.id ? "Kopiert" : "Kopieren"}
                      </Button>
                    </div>
                    <code className="mt-2 block break-words text-[11px] text-white/70">
                      {embedSnippet(agent.id)}
                    </code>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
