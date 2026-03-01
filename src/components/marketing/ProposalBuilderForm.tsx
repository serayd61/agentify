"use client";

import { useState } from "react";
import { FileText, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProposalBuilderFormProps {
  onJobStarted: (jobId: string) => void;
}

type Step = "client" | "project" | "content";

export function ProposalBuilderForm({ onJobStarted }: ProposalBuilderFormProps) {
  const [step, setStep] = useState<Step>("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  // Project fields
  const [title, setTitle] = useState("");
  const [month1, setMonth1] = useState("");
  const [month2, setMonth2] = useState("");
  const [month3, setMonth3] = useState("");

  // Content fields
  const [problems, setProblems] = useState(["", "", "", ""]);
  const [benefits, setBenefits] = useState(["", "", "", ""]);

  const steps: Step[] = ["client", "project", "content"];
  const stepLabels = { client: "Kunde", project: "Projekt", content: "Inhalt" };
  const stepIdx = steps.indexOf(step);

  const canNext =
    step === "client"
      ? firstName && lastName && email && company
      : step === "project"
      ? title && month1
      : problems[0] && benefits[0];

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const problemsMap: Record<string, string> = {};
    const benefitsMap: Record<string, string> = {};
    problems.forEach((p, i) => {
      if (p) problemsMap[`problem0${i + 1}`] = p;
    });
    benefits.forEach((b, i) => {
      if (b) benefitsMap[`benefit0${i + 1}`] = b;
    });

    try {
      const res = await fetch("/api/marketing/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType: "proposal",
          params: {
            client: { firstName, lastName, email, company },
            project: {
              title,
              monthOneInvestment: month1,
              monthTwoInvestment: month2,
              monthThreeInvestment: month3,
              problems: problemsMap,
              benefits: benefitsMap,
            },
          },
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
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                i < stepIdx && "bg-emerald-500/20 text-emerald-400",
                i === stepIdx && "bg-[#ff3b30] text-white",
                i > stepIdx && "bg-white/10 text-white/30"
              )}
            >
              {i < stepIdx ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                i === stepIdx ? "text-white/80" : "text-white/30"
              )}
            >
              {stepLabels[s]}
            </span>
            {i < steps.length - 1 && (
              <div className="w-8 h-px bg-white/10" />
            )}
          </div>
        ))}
      </div>

      {/* Step: Client */}
      {step === "client" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Vorname", value: firstName, setter: setFirstName, placeholder: "Max" },
              { label: "Nachname", value: lastName, setter: setLastName, placeholder: "Mustermann" },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  {label}
                </label>
                <input
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                />
              </div>
            ))}
          </div>
          {[
            { label: "E-Mail", value: email, setter: setEmail, placeholder: "max@firma.de", type: "email" },
            { label: "Unternehmen", value: company, setter: setCompany, placeholder: "Mustermann GmbH" },
          ].map(({ label, value, setter, placeholder, type }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {label}
              </label>
              <input
                type={type ?? "text"}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              />
            </div>
          ))}
        </div>
      )}

      {/* Step: Project */}
      {step === "project" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Projekttitel
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. KI-Lead-Pipeline Implementierung"
              className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Investment (pro Monat)
            </label>
            {[
              { label: "Monat 1", value: month1, setter: setMonth1, placeholder: "€ 2.500" },
              { label: "Monat 2", value: month2, setter: setMonth2, placeholder: "€ 2.000" },
              { label: "Monat 3+", value: month3, setter: setMonth3, placeholder: "€ 1.500 / Monat" },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-16 shrink-0">{label}</span>
                <input
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: Content */}
      {step === "content" && (
        <div className="space-y-5">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              4 Kernprobleme des Kunden
            </label>
            {problems.map((p, i) => (
              <input
                key={i}
                value={p}
                onChange={(e) => {
                  const next = [...problems];
                  next[i] = e.target.value;
                  setProblems(next);
                }}
                placeholder={`Problem ${i + 1}${i === 0 ? " (Pflichtfeld)" : " (optional)"}`}
                className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              />
            ))}
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              4 Kernvorteile deiner Lösung
            </label>
            {benefits.map((b, i) => (
              <input
                key={i}
                value={b}
                onChange={(e) => {
                  const next = [...benefits];
                  next[i] = e.target.value;
                  setBenefits(next);
                }}
                placeholder={`Vorteil ${i + 1}${i === 0 ? " (Pflichtfeld)" : " (optional)"}`}
                className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {stepIdx > 0 && (
          <Button
            type="button"
            onClick={() => setStep(steps[stepIdx - 1])}
            className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white/70 rounded-xl border border-white/[0.08]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Zurück
          </Button>
        )}

        {stepIdx < steps.length - 1 ? (
          <Button
            type="button"
            onClick={() => setStep(steps[stepIdx + 1])}
            disabled={!canNext}
            className="flex-1 bg-[#ff3b30] hover:bg-[#ff5644] text-white rounded-xl disabled:opacity-40"
          >
            Weiter
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !canNext}
            className="flex-1 bg-[#ff3b30] hover:bg-[#ff5644] text-white rounded-xl disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Proposal wird erstellt…
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Proposal generieren
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
