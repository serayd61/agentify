"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadScraperFormProps {
  onJobStarted: (jobId: string) => void;
}

export function LeadScraperForm({ onJobStarted }: LeadScraperFormProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [maxItems, setMaxItems] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !location.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/marketing/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType: "lead_scrape",
          params: { query, location, max_items: maxItems },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unbekannter Fehler");
      onJobStarted(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          Suchbegriff
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="z.B. Klempner, Elektriker, SaaS Agenturen"
          className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 focus:ring-0 transition-colors"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          Standort
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="z.B. Berlin, New York, Schweiz"
          className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 focus:ring-0 transition-colors"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          Anzahl Leads
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={10}
            max={200}
            step={10}
            value={maxItems}
            onChange={(e) => setMaxItems(Number(e.target.value))}
            className="flex-1 accent-[#ff3b30]"
          />
          <span className="text-sm font-bold text-white/80 w-10 text-right">
            {maxItems}
          </span>
        </div>
        <p className="text-xs text-white/30">
          Geschätzte Kosten: ~€{(maxItems * 0.02).toFixed(2)} (Apify)
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !query.trim() || !location.trim()}
        className="w-full bg-[#ff3b30] hover:bg-[#ff5644] text-white rounded-xl py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Leads werden gescrapt…
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            {maxItems} Leads generieren
          </>
        )}
      </Button>
    </form>
  );
}
