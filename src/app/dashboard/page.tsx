"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Bot,
  Plus,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Settings,
  CreditCard,
  CheckCircle2,
  Crown,
  ExternalLink,
  LogOut,
  BarChart3,
  Clock,
  AlertCircle,
} from "lucide-react";

type Customer = {
  id: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
};

type Subscription = {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
};

type CustomerAgent = {
  id: string;
  name: string;
  icon: string | null;
  status: string;
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get('checkout') === 'success';
  
  const [, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [agents, setAgents] = useState<CustomerAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const loadDashboardData = async () => {
    const supabase = getSupabaseBrowser();
    
    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Get customer
      const { data: customerData } = await supabase
        .from('customers')
        .select('id, company_name, first_name, last_name')
        .eq('auth_user_id', user.id)
        .single();
      
      if (customerData) {
        setCustomer(customerData);

        // Get subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('id, plan, status, current_period_end, cancel_at_period_end')
          .eq('customer_id', customerData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (subscriptionData) {
          setSubscription(subscriptionData);
        }

        // Get agents
        const { data: agentsData } = await supabase
          .from('customer_agents')
          .select('id, name, icon, status')
          .eq('customer_id', customerData.id)
          .order('created_at', { ascending: false });
        
        if (agentsData) {
          setAgents(agentsData);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      
      const { url, error } = await response.json();
      
      if (error) {
        console.error('Portal error:', error);
        return;
      }
      
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  const getPlanBadge = () => {
    if (!subscription) {
      return { label: 'Free Trial', color: '#ff9500', icon: Clock };
    }
    
    const planColors: Record<string, string> = {
      basic: '#007aff',
      pro: '#ff3b30',
      enterprise: '#af52de',
      free: '#ff9500',
    };
    
    const planIcons: Record<string, typeof Crown> = {
      basic: Zap,
      pro: Crown,
      enterprise: Crown,
      free: Clock,
    };
    
    return {
      label: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
      color: planColors[subscription.plan] || '#007aff',
      icon: planIcons[subscription.plan] || Zap,
    };
  };

  const planBadge = getPlanBadge();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff3b30] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Checkout Success Alert */}
          {checkoutSuccess && (
            <div className="mb-8 p-4 bg-[#34c759]/10 border border-[#34c759]/30 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#34c759] shrink-0" />
              <p className="text-[#34c759]">
                Willkommen bei Agentify! Ihr Abonnement wurde erfolgreich aktiviert.
              </p>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-[family-name:var(--font-display)]">
                Grüezi{customer?.first_name ? `, ${customer.first_name}` : ''}! 👋
              </h1>
              <p className="text-white/50">
                {customer?.company_name || 'Willkommen in Ihrem Dashboard'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ 
                  background: `${planBadge.color}15`,
                  border: `1px solid ${planBadge.color}30`
                }}
              >
                <planBadge.icon className="w-4 h-4" style={{ color: planBadge.color }} />
                <span className="font-medium" style={{ color: planBadge.color }}>
                  {planBadge.label}
                </span>
              </div>
              <Button variant="secondary" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Abmelden
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { 
                label: 'Aktive Agents', 
                value: agents.filter(a => a.status === 'active').length.toString(), 
                icon: Bot, 
                color: '#ff3b30' 
              },
              { 
                label: 'Nachrichten', 
                value: '0', 
                icon: MessageSquare, 
                color: '#007aff',
                subtext: 'Diesen Monat'
              },
              { 
                label: 'Konversationen', 
                value: '0', 
                icon: Users, 
                color: '#34c759',
                subtext: 'Diesen Monat'
              },
              { 
                label: 'Zufriedenheit', 
                value: '-', 
                icon: TrendingUp, 
                color: '#ff9500',
                subtext: 'Noch keine Daten'
              },
            ].map((stat, i) => (
              <Card key={i} className="text-center py-6">
                <div 
                  className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className="text-3xl font-bold text-white mb-1 font-[family-name:var(--font-display)]">
                  {stat.value}
                </div>
                <div className="text-sm text-white/40">{stat.label}</div>
                {stat.subtext && (
                  <div className="text-xs text-white/30 mt-1">{stat.subtext}</div>
                )}
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Agents Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
                    Ihre Agents
                  </h2>
                  <Button asChild>
                    <Link href="/dashboard/agents/new">
                      <Plus className="w-4 h-4" />
                      Neuer Agent
                    </Link>
                  </Button>
                </div>

                {agents.length === 0 ? (
                  <Card className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                      <Bot className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-display)]">
                      Noch keine Agents
                    </h3>
                    <p className="text-white/50 mb-6 max-w-sm mx-auto">
                      Erstellen Sie Ihren ersten KI-Assistenten und beginnen Sie, 
                      Ihre Kunden zu begeistern.
                    </p>
                    <Button asChild>
                      <Link href="/marketplace">
                        Agent aus Marketplace wählen
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <Card key={agent.id} hover className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff3b30]/20 to-[#ff9500]/20 flex items-center justify-center text-3xl">
                            {agent.icon || '🤖'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{agent.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span 
                                className={`w-2 h-2 rounded-full ${
                                  agent.status === 'active' ? 'bg-[#34c759]' : 'bg-white/30'
                                }`} 
                              />
                              <span className="text-sm text-white/50">
                                {agent.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="secondary" size="sm" asChild>
                            <Link href={`/dashboard/agents/${agent.id}`}>
                              <Settings className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="secondary" size="sm" asChild>
                            <Link href={`/dashboard/agents/${agent.id}/analytics`}>
                              <BarChart3 className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-bold text-white mb-6 font-[family-name:var(--font-display)]">
                  Schnellzugriff
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/marketplace">
                    <Card hover className="h-full">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#ff3b30]/15 flex items-center justify-center">
                          <Bot className="w-6 h-6 text-[#ff3b30]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">Marketplace</h3>
                          <p className="text-sm text-white/50">Neue Agents entdecken</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/30" />
                      </div>
                    </Card>
                  </Link>
                  <Link href="/dashboard/integrations">
                    <Card hover className="h-full">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#007aff]/15 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-[#007aff]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">Integrationen</h3>
                          <p className="text-sm text-white/50">Bexio, WhatsApp & mehr</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/30" />
                      </div>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Subscription Card */}
              <Card className="border-[#ff3b30]/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff3b30]/20 to-[#ff9500]/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#ff3b30]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Abonnement</h3>
                    <p className="text-sm text-white/50">
                      {subscription ? planBadge.label : 'Kein aktives Abo'}
                    </p>
                  </div>
                </div>

                {subscription ? (
                  <>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Status</span>
                        <span className={`font-medium ${
                          subscription.status === 'active' ? 'text-[#34c759]' : 'text-[#ff9500]'
                        }`}>
                          {subscription.status === 'active' ? 'Aktiv' : subscription.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Nächste Zahlung</span>
                        <span className="text-white">
                          {new Date(subscription.current_period_end).toLocaleDateString('de-CH')}
                        </span>
                      </div>
                      {subscription.cancel_at_period_end && (
                        <div className="flex items-center gap-2 text-sm text-[#ff9500]">
                          <AlertCircle className="w-4 h-4" />
                          <span>Wird zum Periodenende gekündigt</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={openCustomerPortal}
                      isLoading={portalLoading}
                    >
                      Abonnement verwalten
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-white/60 text-sm mb-6">
                      Upgraden Sie auf einen bezahlten Plan, um alle Funktionen freizuschalten.
                    </p>
                    <Button className="w-full" asChild>
                      <Link href="/pricing">
                        <Crown className="w-4 h-4" />
                        Upgrade
                      </Link>
                    </Button>
                  </>
                )}
              </Card>

              {/* Usage Card */}
              <Card>
                <h3 className="font-semibold text-white mb-4">Nutzung diesen Monat</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/50">Nachrichten</span>
                      <span className="text-white">0 / 5&apos;000</span>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-[#ff3b30] to-[#ff9500] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/50">Agents</span>
                      <span className="text-white">{agents.length} / 3</span>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#007aff] to-[#5ac8fa] rounded-full transition-all"
                        style={{ width: `${(agents.length / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Help Card */}
              <Card className="bg-gradient-to-br from-[#12121c] to-[#0d0d14]">
                <h3 className="font-semibold text-white mb-3">Brauchen Sie Hilfe?</h3>
                <p className="text-sm text-white/50 mb-4">
                  Unser Support-Team hilft Ihnen gerne weiter.
                </p>
                <Button variant="secondary" size="sm" className="w-full" asChild>
                  <a href="mailto:support@agentify.ch">
                    Support kontaktieren
                  </a>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff3b30] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
