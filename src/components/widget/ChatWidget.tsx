"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  agentName?: string;
  agentIcon?: string;
  primaryColor?: string;
  greeting?: string;
  position?: "bottom-right" | "bottom-left";
  agentId?: string;
}

export function ChatWidget({
  agentName = "Assistent",
  agentIcon = "🤖",
  primaryColor = "#DC2626",
  greeting = "Grüezi! Wie kann ich Ihnen helfen?",
  position = "bottom-right",
  agentId,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadData, setLeadData] = useState({ name: "", phone: "", message: "" });
  const [showApptForm, setShowApptForm] = useState(false);
  const [isSubmittingAppt, setIsSubmittingAppt] = useState(false);
  const [apptSuccess, setApptSuccess] = useState(false);
  const [apptData, setApptData] = useState({ name: "", phone: "", date: "", time: "", notes: "" });
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));

    const responses = [
      "Vielen Dank für Ihre Anfrage! Ich helfe Ihnen gerne weiter.",
      "Das ist eine gute Frage. Lassen Sie mich Ihnen mehr dazu erzählen.",
      "Ich verstehe. Können Sie mir mehr Details geben?",
      "Natürlich! Ich kann Ihnen dabei helfen.",
    ];

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleLeadSubmit = async () => {
    if (!agentId) {
      setLeadSuccess(false);
      return;
    }
    setIsSubmittingLead(true);
    setLeadSuccess(false);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          name: leadData.name,
          phone: leadData.phone,
          message: leadData.message,
        }),
      });
      if (response.ok) {
        setLeadSuccess(true);
        setLeadData({ name: "", phone: "", message: "" });
      }
    } catch (error) {
      console.error("Lead submit failed", error);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleAppointmentSubmit = async () => {
    if (!agentId) return;
    if (!apptData.name || !apptData.date || !apptData.time) return;
    setIsSubmittingAppt(true);
    setApptSuccess(false);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          name: apptData.name,
          email: "",
          phone: apptData.phone,
          date: apptData.date,
          time: apptData.time,
          notes: apptData.notes,
        }),
      });
      if (response.ok) {
        setApptSuccess(true);
        setApptData({ name: "", phone: "", date: "", time: "", notes: "" });
      }
    } catch (error) {
      console.error("Appointment submit failed", error);
    } finally {
      setIsSubmittingAppt(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "fixed z-50",
        position === "bottom-right" ? "bottom-6 right-6" : "bottom-6 left-6"
      )}
    >
      {/* Chat Window */}
      {isOpen && (
        <div
          className="mb-4 w-[380px] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-scale-in"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                {agentIcon}
              </div>
              <div className="text-white">
                <h3 className="font-semibold">{agentName}</h3>
                <p className="text-sm text-white/70">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-4 bg-neutral-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm",
                    message.role === "user"
                      ? "rounded-tr-none text-white"
                      : "bg-white border border-neutral-200 rounded-tl-none text-neutral-800"
                  )}
                  style={message.role === "user" ? { backgroundColor: primaryColor } : {}}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-none px-4 py-2.5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 pb-3 bg-white border-t border-neutral-200 space-y-3">
            {!showLeadForm && !showApptForm && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowLeadForm(true);
                    setShowApptForm(false);
                    setLeadSuccess(false);
                  }}
                  className="w-full text-left text-sm text-neutral-600 underline"
                >
                  Rückruf anfordern
                </button>
                <button
                  onClick={() => {
                    setShowApptForm(true);
                    setShowLeadForm(false);
                    setApptSuccess(false);
                  }}
                  className="w-full text-left text-sm text-neutral-600 underline"
                >
                  Termin buchen
                </button>
              </div>
            )}

            {showLeadForm && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Rückruf anfordern</p>
                  <button
                    onClick={() => setShowLeadForm(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    Abbrechen
                  </button>
                </div>
                <input
                  value={leadData.name}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                />
                <input
                  value={leadData.phone}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Telefonnummer"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                />
                <textarea
                  value={leadData.message}
                  onChange={(e) => setLeadData((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Wie dürfen wir Sie unterstützen?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                />
                <button
                  onClick={handleLeadSubmit}
                  disabled={isSubmittingLead}
                  className="w-full px-4 py-2 rounded-xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmittingLead ? "Senden..." : "Absenden"}
                </button>
                {leadSuccess && (
                  <p className="text-xs text-green-600">Danke! Wir melden uns bald.</p>
                )}
              </div>
            )}

            {showApptForm && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Termin buchen</p>
                  <button
                    onClick={() => setShowApptForm(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    Abbrechen
                  </button>
                </div>
                <input
                  value={apptData.name}
                  onChange={(e) => setApptData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                />
                <input
                  value={apptData.phone}
                  onChange={(e) => setApptData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Telefonnummer"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={apptData.date}
                    onChange={(e) => setApptData((prev) => ({ ...prev, date: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                  />
                  <select
                    value={apptData.time}
                    onChange={(e) => setApptData((prev) => ({ ...prev, time: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                  >
                    <option value="">Uhrzeit wählen</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={apptData.notes}
                  onChange={(e) => setApptData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notizen"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                />
                <button
                  onClick={handleAppointmentSubmit}
                  disabled={isSubmittingAppt}
                  className="w-full px-4 py-2 rounded-xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmittingAppt ? "Senden..." : "Terminanfrage senden"}
                </button>
                {apptSuccess && (
                  <p className="text-xs text-green-600">Terminanfrage gesendet! Wir bestätigen bald.</p>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-neutral-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nachricht eingeben..."
                className="flex-1 px-4 py-2.5 bg-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-4 py-2.5 rounded-xl text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-400 text-center mt-2">
              Powered by Agentify.ch
            </p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        style={{ backgroundColor: primaryColor }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}


