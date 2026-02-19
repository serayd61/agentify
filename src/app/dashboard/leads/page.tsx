"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const statusOptions = [
  { value: "new", label: "Neu" },
  { value: "contacted", label: "Kontaktiert" },
  { value: "converted", label: "Konvertiert" },
];

type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

export default function DashboardLeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeads = async () => {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase
        .from("leads")
        .select("id, name, email, phone, message, status, created_at")
        .order("created_at", { ascending: false });
      setLeads(data || []);
      setLoading(false);
    };
    loadLeads();
  }, []);

  const [now] = useState(() => Date.now());

  const stats = useMemo(() => {
    const total = leads.length;
    const weekThreshold = now - 1000 * 60 * 60 * 24 * 7;
    const thisWeek = leads.filter((lead) => new Date(lead.created_at).getTime() >= weekThreshold).length;
    const conversions = leads.filter((lead) => lead.status === "converted").length;
    const ratio = total === 0 ? 0 : Math.round((conversions / total) * 100);
    return { total, thisWeek, ratio };
  }, [leads, now]);

  const updateStatus = async (leadId: string, newStatus: string) => {
    const supabase = getSupabaseBrowser();
    await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-white flex items-center justify-center">
        <p>Lädt Leads …</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <Header />
      <main className="flex-1 py-10">
        <div className="container space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Leads</p>
              <h1 className="text-3xl font-bold">Kundenanfragen</h1>
              <p className="text-xs text-white/60">Verwalte neue Kontakte, teile Widget Links und skaliere dein Team.</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/agents/new" className="flex items-center gap-2">
                Agenten erstellen
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-card border border-white/[0.08]">
              <p className="text-sm text-white/60">Gesamtleads</p>
              <p className="text-3xl font-semibold">{stats.total}</p>
            </Card>
            <Card className="p-4 bg-card border border-white/[0.08]">
              <p className="text-sm text-white/60">Diese Woche</p>
              <p className="text-3xl font-semibold">{stats.thisWeek}</p>
            </Card>
            <Card className="p-4 bg-card border border-white/[0.08]">
              <p className="text-sm text-white/60">Datenkonversion</p>
              <p className="text-3xl font-semibold">{stats.ratio}%</p>
            </Card>
          </div>
          {leads.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-lg font-semibold">Noch keine Leads</p>
              <p className="text-sm text-white/60">Teile deinen Widget-Link, damit Besucher dich kontaktieren können.</p>
            </Card>
          ) : (
            <Card className="p-6 overflow-auto bg-card border border-white/[0.08]">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.3em] text-white/50">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">E-Mail</th>
                    <th className="pb-3">Telefon</th>
                    <th className="pb-3">Nachricht</th>
                    <th className="pb-3">Datum</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="text-white/80">
                      <td className="py-3">{lead.name || "-"}</td>
                      <td className="py-3">{lead.email || "-"}</td>
                      <td className="py-3">{lead.phone || "-"}</td>
                      <td className="py-3 max-w-[220px] line-clamp-2 break-words">{lead.message || "—"}</td>
                      <td className="py-3">{new Date(lead.created_at).toLocaleString("de-CH")}</td>
                      <td className="py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className="bg-[#05050a]/60 border border-white/[0.08] rounded-full px-3 py-1 text-xs text-white"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-[#05050a]">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
