"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "canceled", label: "Abgesagt" },
];

type Appointment = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  date: string;
  time: string;
  status: string;
  created_at: string;
};

export default function DashboardAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase
        .from("appointments")
        .select("*, agents(name)")
        .order("date", { ascending: false });
      setAppointments(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const [now] = useState(() => Date.now());
  const filteredAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.date).getTime();
    if (filter === "week") {
      return apptDate >= now - 1000 * 60 * 60 * 24 * 7;
    }
    return apptDate >= now - 1000 * 60 * 60 * 24 * 30;
  });

  const updateStatus = async (id: string, status: string) => {
    const supabase = getSupabaseBrowser();
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments((prev) => prev.map((appt) => (appt.id === id ? { ...appt, status } : appt)));
  };

  if (loading) {
    return <div className="min-h-screen bg-surface text-white flex items-center justify-center">Lädt Termine...</div>;
  }

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <Header />
      <main className="flex-1 py-10">
        <div className="container space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Termine</p>
              <h1 className="text-3xl font-bold">Kalender</h1>
            </div>
            <div className="flex gap-3">
              <Button variant={filter === "week" ? "default" : "ghost"} onClick={() => setFilter("week")}>Diese Woche</Button>
              <Button variant={filter === "month" ? "default" : "ghost"} onClick={() => setFilter("month")}>Dieser Monat</Button>
            </div>
          </div>
          {filteredAppointments.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-lg font-semibold">Noch keine Termine</p>
              <p className="text-sm text-white/60">Freigeben Sie Ihren Widget-Link, damit Kunden buchen können.</p>
            </Card>
          ) : (
            <Card className="p-6 overflow-x-auto bg-card border border-white/[0.08]">
              <table className="w-full text-sm text-white/80">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.4em] text-white/50">
                    <th className="pb-3">Datum</th>
                    <th className="pb-3">Zeit</th>
                    <th className="pb-3">Kunde</th>
                    <th className="pb-3">Telefon</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td className="py-3">{new Date(appt.date).toLocaleDateString("de-CH")}</td>
                      <td className="py-3">{appt.time}</td>
                      <td className="py-3">{appt.name}</td>
                      <td className="py-3">{appt.phone || "-"}</td>
                      <td className="py-3">
                        <select
                          value={appt.status}
                          onChange={(e) => updateStatus(appt.id, e.target.value)}
                          className="text-sm bg-[#05050a] border border-white/[0.08] rounded-full px-3 py-1"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-[#05050a]">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <a href="mailto:appointments@agentify.ch">Bestätigung senden</a>
                        </Button>
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
