"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Volume2 } from "lucide-react";
import AIAvatar from "@/components/demo/AIAvatar";
import { demoScenarios } from "@/lib/demo-scenarios";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function DemoChat({ sector, sectorName }: { sector: string; sectorName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scenario = demoScenarios[sector] || demoScenarios.treuhand;

  useEffect(() => {
    setMessages([
      {
        id: `welcome-${sector}`,
        role: "assistant",
        content: scenario.welcomeMessage,
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }, [sector, scenario.welcomeMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const quickActions = scenario.suggestedQuestions;

  const sendMessage = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput("");
    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: value,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);
    setIsSpeaking(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector,
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Der Chat-Service ist momentan nicht erreichbar.");
        setIsTyping(false);
        setIsSpeaking(false);
        return;
      }

      const assistantMessage: Message = {
        id: `msg-assistant-${Date.now()}`,
        role: "assistant",
        content: payload.message || "Das kann ich gerne für Sie klären.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setError("Der Demo-Chat konnte Ihre Nachricht nicht senden.");
    } finally {
      setIsTyping(false);
      setIsSpeaking(false);
    }
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-[#0c0c16] border border-white/5 rounded-[2rem] shadow-[0_45px_80px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col">
      <div className="px-5 pt-6 pb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AIAvatar isThinking={isTyping} isSpeaking={isSpeaking} />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">{scenario.name}</p>
            <p className="text-sm font-semibold text-white">{sectorName}</p>
          </div>
        </div>
        <div className="text-right text-xs text-white/50">Live · {formatTime(new Date())}</div>
      </div>
      <div ref={scrollRef} className="px-5 pt-2 pb-4 space-y-4 overflow-y-auto max-h-[420px]" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[85%]">
                <div
                  className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-[#ff6b53] to-[#ff3b30] text-white"
                      : "bg-white/5 text-white border border-white/10"
                  }`}
                >
                  <p>{message.content}</p>
                  <span className="absolute -bottom-4 right-3 text-[10px] uppercase tracking-[0.3em] text-white/50">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="max-w-[70%]">
                <div className="px-4 py-3 rounded-2xl bg-white/5 text-white/70 border border-white/10">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" style={{ animationDuration: "0.6s" }} />
                    <span
                      className="w-2 h-2 rounded-full bg-white animate-ping"
                      style={{ animationDuration: "0.6s", animationDelay: "120ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-white animate-ping"
                      style={{ animationDuration: "0.6s", animationDelay: "240ms" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <div className="px-4 py-3 rounded-2xl bg-[#ff3b30]/10 text-sm text-[#ff3b30] border border-[#ff3b30]/30">
            {error}
          </div>
        )}
      </div>
      <div className="px-5 pb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-[11px] uppercase tracking-[0.3em] px-4 py-2 border border-white/10 rounded-full text-white/60 hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 rounded-2xl border border-white/10 bg-white/5" aria-label="Spracherkennung">
            <Mic className="w-4 h-4 text-white" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ihre Frage an die KI..."
            className="flex-1 bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
          />
          <button
            onClick={() => sendMessage()}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#ff6b53] to-[#ff3b30] text-white shadow-[0_15px_35px_rgba(255,59,48,0.4)]"
          >
            <Send className="w-4 h-4" />
            <span className="text-xs uppercase tracking-[0.3em]">Senden</span>
          </button>
          <button className="p-3 rounded-2xl border border-white/10 bg-white/5" aria-label="Ton">
            <Volume2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
