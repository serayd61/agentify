"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Save,
  Eye,
  Code2,
  Settings,
  MessageSquare,
  Plus,
  Trash2,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  greeting: string;
  systemPrompt: string;
  customInstructions: string[];
  integrations: string[];
  isActive: boolean;
}

const defaultAgent: Agent = {
  id: "",
  name: "Neuer Agent",
  description: "Beschreibung des Agenten",
  icon: "🤖",
  color: "#8b5cf6",
  greeting: "Hallo! Wie kann ich Ihnen helfen?",
  systemPrompt: "Sie sind ein hilfreicher KI-Assistent.",
  customInstructions: [],
  integrations: [],
  isActive: true,
};

export default function AgentEditorPage() {
  const params = useParams();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent>(defaultAgent);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id && params.id !== "new") {
      // In production, fetch agent data from API
      setAgent({
        ...defaultAgent,
        id: params.id as string,
        name: "Treuhand-Assistent",
        description: "Professioneller Assistent für Treuhand-Dienstleistungen",
        icon: "📊",
        color: "#dc2626",
        greeting: "Grüezi! Ich bin der Treuhand-Assistent. Wie kann ich Ihnen helfen?",
        systemPrompt:
          "Du bist ein erfahrener Treuhand-Assistent mit Expertise in Schweizer Steuern und Buchhaltung.",
      });
    }
  }, [params.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In production, save to API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Erfolg",
        description: "Agent-Einstellungen wurden gespeichert.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Fehler",
        description: "Agent konnte nicht gespeichert werden.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyEmbedCode = async () => {
    const embedCode = `<iframe src="https://agentify.ch/widget/${agent.id}" width="100%" height="600"></iframe>`;
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Kopiert",
      description: "Embed-Code wurde in die Zwischenablage kopiert.",
      variant: "success",
    });
  };

  const addInstruction = () => {
    setAgent({
      ...agent,
      customInstructions: [...agent.customInstructions, ""],
    });
  };

  const removeInstruction = (index: number) => {
    setAgent({
      ...agent,
      customInstructions: agent.customInstructions.filter((_, i) => i !== index),
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...agent.customInstructions];
    newInstructions[index] = value;
    setAgent({ ...agent, customInstructions: newInstructions });
  };

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex-1 py-12"
      >
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zu Agents
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{agent.icon}</span>
                <h1 className="text-4xl font-bold text-white">{agent.name}</h1>
              </div>
              <p className="text-white/60">Bearbeiten Sie die Einstellungen Ihres KI-Agenten.</p>
            </div>
            <Button onClick={handleSave} isLoading={isSaving} size="lg">
              <Save className="w-5 h-5" />
              Speichern
            </Button>
          </div>

          {/* Tabs */}
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Tabs.List className="flex gap-4 border-b border-white/10 overflow-x-auto">
              {[
                { value: "general", label: "Allgemein", icon: Settings },
                { value: "behavior", label: "Verhalten", icon: MessageSquare },
                { value: "integrations", label: "Integrationen", icon: Zap },
                { value: "embed", label: "Einbetten", icon: Code2 },
                { value: "preview", label: "Vorschau", icon: Eye },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white/60 hover:text-white border-b-2 border-transparent hover:border-white/20 transition-all data-[state=active]:border-[#8b5cf6] data-[state=active]:text-white cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>

            {/* General Tab */}
            <Tabs.Content value="general" className="space-y-6">
              <Card className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                    placeholder="z.B. Support-Bot"
                    className="w-full px-4 py-2 bg-[#0f0f1a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value={agent.description}
                    onChange={(e) => setAgent({ ...agent, description: e.target.value })}
                    placeholder="Beschreiben Sie, wofür dieser Agent zuständig ist..."
                    rows={3}
                    className="w-full px-4 py-2 bg-[#0f0f1a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50 resize-none"
                  />
                </div>

                {/* Icon & Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      value={agent.icon}
                      onChange={(e) => setAgent({ ...agent, icon: e.target.value })}
                      maxLength={1}
                      className="w-full px-4 py-2 bg-[#0f0f1a] border border-white/10 rounded-lg text-white text-2xl text-center focus:outline-none focus:border-[#8b5cf6]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Farbe
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={agent.color}
                        onChange={(e) => setAgent({ ...agent, color: e.target.value })}
                        className="w-12 h-10 rounded-lg border border-white/10 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={agent.color}
                        onChange={(e) => setAgent({ ...agent, color: e.target.value })}
                        className="flex-1 px-4 py-2 bg-[#0f0f1a] border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#8b5cf6]/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/10">
                  <div>
                    <p className="text-sm font-medium text-white">Agent aktiv</p>
                    <p className="text-xs text-white/50">Dieser Agent ist verfügbar</p>
                  </div>
                  <button
                    onClick={() => setAgent({ ...agent, isActive: !agent.isActive })}
                    className={`relative w-12 h-7 rounded-full border transition-all ${
                      agent.isActive
                        ? "bg-[#34c759]/20 border-[#34c759]/30"
                        : "bg-white/10 border-white/20"
                    }`}
                  >
                    <div
                      className={`absolute inset-0.5 w-3 h-3 rounded-full transition-all ${
                        agent.isActive
                          ? "bg-[#34c759] right-0.5"
                          : "bg-white/30 left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </Card>
            </Tabs.Content>

            {/* Behavior Tab */}
            <Tabs.Content value="behavior" className="space-y-6">
              <Card className="p-6 space-y-6">
                {/* Greeting */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Begrüßungsnachricht
                  </label>
                  <textarea
                    value={agent.greeting}
                    onChange={(e) => setAgent({ ...agent, greeting: e.target.value })}
                    placeholder="z.B. Hallo! Wie kann ich Ihnen heute helfen?"
                    rows={2}
                    className="w-full px-4 py-2 bg-[#0f0f1a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50 resize-none"
                  />
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    System Prompt
                  </label>
                  <textarea
                    value={agent.systemPrompt}
                    onChange={(e) => setAgent({ ...agent, systemPrompt: e.target.value })}
                    placeholder="Definieren Sie das Verhalten und die Persönlichkeit des Agenten..."
                    rows={4}
                    className="w-full px-4 py-2 bg-[#0f0f1a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50 resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-white/50 mt-2">
                    Dies bestimmt, wie der Agent antworten wird.
                  </p>
                </div>

                {/* Custom Instructions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-white/80">
                      Benutzerdefinierte Anweisungen
                    </label>
                    <Button size="sm" variant="outline" onClick={addInstruction}>
                      <Plus className="w-4 h-4" />
                      Hinzufügen
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {agent.customInstructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          placeholder={`Anweisung ${index + 1}`}
                          className="flex-1 px-4 py-2 bg-[#0f0f1a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeInstruction(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Tabs.Content>

            {/* Integrations Tab */}
            <Tabs.Content value="integrations" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Verfügbare Integrationen
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: "email", name: "E-Mail", icon: "📧" },
                    { id: "slack", name: "Slack", icon: "💬" },
                    { id: "whatsapp", name: "WhatsApp", icon: "📱" },
                    { id: "telegram", name: "Telegram", icon: "✈️" },
                    { id: "discord", name: "Discord", icon: "🎮" },
                    { id: "api", name: "API", icon: "🔌" },
                  ].map((integration) => (
                    <button
                      key={integration.id}
                      onClick={() => {
                        const isActive = agent.integrations.includes(integration.id);
                        setAgent({
                          ...agent,
                          integrations: isActive
                            ? agent.integrations.filter((i) => i !== integration.id)
                            : [...agent.integrations, integration.id],
                        });
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        agent.integrations.includes(integration.id)
                          ? "border-[#8b5cf6] bg-[#8b5cf6]/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <div className="text-2xl mb-2">{integration.icon}</div>
                      <p className="text-sm font-medium text-white">
                        {integration.name}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>
            </Tabs.Content>

            {/* Embed Tab */}
            <Tabs.Content value="embed" className="space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Embed-Code
                </h3>
                <p className="text-sm text-white/60">
                  Kopieren Sie diesen Code und fügen Sie ihn auf Ihrer Website ein:
                </p>
                <div className="relative p-4 bg-[#0f0f1a] border border-white/10 rounded-lg">
                  <code className="text-xs text-white/70 break-all font-mono">
                    {`<iframe src="https://agentify.ch/widget/${agent.id}" width="100%" height="600"></iframe>`}
                  </code>
                  <button
                    onClick={handleCopyEmbedCode}
                    className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-[#34c759]" />
                    ) : (
                      <Copy className="w-5 h-5 text-white/50" />
                    )}
                  </button>
                </div>
              </Card>
            </Tabs.Content>

            {/* Preview Tab */}
            <Tabs.Content value="preview" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Vorschau
                </h3>
                <div
                  className="h-96 rounded-lg border border-white/10 overflow-hidden"
                  style={{ backgroundColor: agent.color + "20" }}
                >
                  <div className="h-full flex flex-col">
                    <div
                      className="px-4 py-3 flex items-center gap-3"
                      style={{ backgroundColor: agent.color }}
                    >
                      <div className="text-2xl">{agent.icon}</div>
                      <div className="text-white">
                        <p className="font-semibold text-sm">{agent.name}</p>
                        <p className="text-white/70 text-xs">Online</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-white text-sm mb-4">
                          {agent.greeting}
                        </p>
                        <p className="text-white/50 text-xs">
                          Dies ist eine Vorschau des Agenten.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}
