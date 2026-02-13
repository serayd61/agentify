"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Plus,
  Check,
  AlertCircle,
  Settings,
  Copy,
  Zap,
  Mail,
  MessageCircle,
  Smartphone,
  Send,
  Gamepad2,
  Code2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className: string }>;
  connected: boolean;
  webhookUrl?: string;
  apiKey?: string;
  status: "active" | "inactive" | "error";
}

const integrations: Integration[] = [
  {
    id: "email",
    name: "E-Mail",
    description: "Antworten auf E-Mails automatisch",
    icon: Mail,
    connected: true,
    status: "active",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Integration mit Slack-Workspace",
    icon: MessageCircle,
    connected: false,
    status: "inactive",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Automatische WhatsApp-Antworten",
    icon: MessageCircle,
    connected: true,
    status: "active",
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Bot für Telegram-Gruppen",
    icon: Send,
    connected: false,
    status: "inactive",
  },
  {
    id: "discord",
    name: "Discord",
    description: "Discord-Server Integration",
    icon: Gamepad2,
    connected: false,
    status: "inactive",
  },
  {
    id: "api",
    name: "Webhook API",
    description: "Custom API & Webhooks",
    icon: Code2,
    connected: true,
    status: "active",
  },
];

// Integration card component
function IntegrationCard({
  integration,
  onConnect,
}: {
  integration: Integration;
  onConnect: (id: string) => void;
}) {
  const Icon = integration.icon;
  const statusColors = {
    active: { bg: "[#34c759]/10", border: "[#34c759]/30", text: "[#34c759]" },
    inactive: { bg: "white/5", border: "white/10", text: "white/50" },
    error: { bg: "[#ff3b30]/10", border: "[#ff3b30]/30", text: "[#ff3b30]" },
  };

  const statusColor = statusColors[integration.status];

  return (
    <motion.div variants={fadeInUp}>
      <Card className={`p-6 border-2 border-${statusColor.border}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
              <p className="text-sm text-white/60">{integration.description}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-semibold bg-${statusColor.bg} border border-${statusColor.border} text-${statusColor.text}`}>
            {integration.status === "active" && "Aktiv"}
            {integration.status === "inactive" && "Inaktiv"}
            {integration.status === "error" && "Fehler"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {integration.connected ? (
            <>
              <Button size="sm" variant="secondary" className="flex-1">
                <Settings className="w-4 h-4" />
                Einstellungen
              </Button>
              <Button size="sm" variant="outline">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={() => onConnect(integration.id)}
            >
              <Plus className="w-4 h-4" />
              Verbinden
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// Integration modal
function IntegrationModal({
  integration,
  onClose,
}: {
  integration: Integration;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    apiKey: integration.apiKey || "",
    webhookUrl: integration.webhookUrl || "",
  });

  const handleConnect = () => {
    toast({
      title: "Erfolg",
      description: `${integration.name} wurde verbunden.`,
      variant: "success",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0f0f1a] border border-white/10 rounded-xl max-w-md w-full p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">
          {integration.name} verbinden
        </h2>

        <div className="space-y-4 mb-6">
          {integration.id === "slack" && (
            <>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Workspace URL
                </label>
                <input
                  type="text"
                  placeholder="https://your-workspace.slack.com"
                  className="w-full px-4 py-2 bg-[#05050a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Bot Token
                </label>
                <input
                  type="password"
                  placeholder="xoxb-..."
                  className="w-full px-4 py-2 bg-[#05050a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50"
                />
              </div>
            </>
          )}

          {integration.id === "api" && (
            <>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value={formData.webhookUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, webhookUrl: e.target.value })
                  }
                  placeholder="https://api.example.com/webhook"
                  className="w-full px-4 py-2 bg-[#05050a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50"
                />
              </div>
            </>
          )}

          <div className="p-3 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-[#3b82f6] shrink-0 mt-0.5" />
            <p className="text-xs text-[#3b82f6]">
              API-Schlüssel werden verschlüsselt gespeichert.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Abbrechen
          </Button>
          <Button className="flex-1" onClick={handleConnect}>
            Verbinden
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [connectedIntegrations, setConnectedIntegrations] = useState(
    integrations.filter((i) => i.connected)
  );
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);

  const handleConnect = (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (integration) {
      setSelectedIntegration(integration);
    }
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
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Integrationen</h1>
            <p className="text-white/60">
              Verbinden Sie Ihre Lieblingstools und -plattformen mit Agentify.
            </p>
          </div>

          {/* Info Box */}
          <motion.div
            variants={fadeInUp}
            className="p-4 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg mb-8 flex gap-3"
          >
            <Zap className="w-5 h-5 text-[#8b5cf6] shrink-0" />
            <p className="text-sm text-[#8b5cf6]">
              Integrationen ermöglichen es Ihrem Agent, auf mehreren Kanälen aktiv zu sein.
            </p>
          </motion.div>

          {/* Connected Integrations */}
          {connectedIntegrations.length > 0 && (
            <motion.div variants={fadeInUp} className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Verbundene Integrationen</h2>
              <div className="grid gap-4">
                {connectedIntegrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={handleConnect}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Available Integrations */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Verfügbare Integrationen
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.main>

      {/* Modal */}
      {selectedIntegration && (
        <IntegrationModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}

      <Footer />
    </div>
  );
}
