"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Bot, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  campaign_id: string;
  campaign_name: string;
  knowledge_base: string;
  autoreply_active: boolean;
}

export function AutoreplyToggle() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newCampaignId, setNewCampaignId] = useState("");
  const [newCampaignName, setNewCampaignName] = useState("");
  const [adding, setAdding] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from("marketing_campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCampaigns((data as Campaign[]) ?? []);
        setLoading(false);
      });
  }, []);

  async function toggleAutoreply(campaign: Campaign) {
    if (!supabase) return;
    setSaving(campaign.id);
    const newVal = !campaign.autoreply_active;
    await supabase
      .from("marketing_campaigns")
      .update({ autoreply_active: newVal })
      .eq("id", campaign.id);
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaign.id ? { ...c, autoreply_active: newVal } : c))
    );
    setSaving(null);
  }

  async function saveKnowledgeBase(campaign: Campaign, kb: string) {
    if (!supabase) return;
    setSaving(campaign.id);
    await supabase
      .from("marketing_campaigns")
      .update({ knowledge_base: kb })
      .eq("id", campaign.id);
    setSaving(null);
  }

  async function addCampaign() {
    if (!supabase || !newCampaignId || !newCampaignName) return;
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("marketing_campaigns")
        .insert({
          user_id: user.id,
          campaign_id: newCampaignId,
          campaign_name: newCampaignName,
        })
        .select("*")
        .single();
      if (data) setCampaigns((prev) => [data as Campaign, ...prev]);
    }
    setNewCampaignId("");
    setNewCampaignName("");
    setAdding(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-white/40">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Kampagnen werden geladen…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add campaign */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          Kampagne hinzufügen
        </p>
        <div className="flex gap-2">
          <input
            value={newCampaignId}
            onChange={(e) => setNewCampaignId(e.target.value)}
            placeholder="Instantly Campaign ID"
            className="flex-1 rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
          />
          <input
            value={newCampaignName}
            onChange={(e) => setNewCampaignName(e.target.value)}
            placeholder="Name"
            className="flex-1 rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
          />
          <Button
            onClick={addCampaign}
            disabled={adding || !newCampaignId || !newCampaignName}
            className="bg-[#ff3b30] hover:bg-[#ff5644] text-white rounded-xl px-4 disabled:opacity-40"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "+"}
          </Button>
        </div>
      </div>

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
          <Bot className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40">Keine Kampagnen konfiguriert</p>
          <p className="text-xs text-white/25 mt-1">
            Füge deine Instantly-Kampagnen-IDs oben hinzu
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              saving={saving === campaign.id}
              onToggle={() => toggleAutoreply(campaign)}
              onSaveKb={(kb) => saveKnowledgeBase(campaign, kb)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignCard({
  campaign,
  saving,
  onToggle,
  onSaveKb,
}: {
  campaign: Campaign;
  saving: boolean;
  onToggle: () => void;
  onSaveKb: (kb: string) => void;
}) {
  const [kb, setKb] = useState(campaign.knowledge_base);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#12121c] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/80 truncate">
            {campaign.campaign_name}
          </p>
          <p className="text-xs text-white/35 font-mono truncate">
            {campaign.campaign_id}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-white/40 hover:text-white/60 transition-colors px-2"
        >
          {expanded ? "▲" : "▼"}
        </button>

        {/* Toggle switch */}
        <button
          onClick={onToggle}
          disabled={saving}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
            campaign.autoreply_active ? "bg-emerald-500" : "bg-white/10",
            saving && "opacity-50 cursor-wait"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
              campaign.autoreply_active && "translate-x-5"
            )}
          />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] px-4 py-3 space-y-3">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Knowledge Base (Kontext für Claude)
          </label>
          <textarea
            value={kb}
            onChange={(e) => setKb(e.target.value)}
            rows={4}
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/80 placeholder-white/25 outline-none focus:border-white/20 transition-colors resize-none font-mono"
            placeholder="Beschreibe das Angebot, Ton, Zielgruppe…"
          />
          <Button
            onClick={() => onSaveKb(kb)}
            disabled={saving}
            className="bg-white/[0.06] hover:bg-white/[0.10] text-white/70 rounded-lg text-xs px-3 py-1.5 border border-white/[0.08]"
          >
            {saving ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Save className="w-3 h-3 mr-1" />
            )}
            Speichern
          </Button>
        </div>
      )}
    </div>
  );
}
