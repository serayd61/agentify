-- =====================================================
-- AGENTIFY.CH DATABASE SCHEMA
-- Online Satış ve Subscription Yönetimi
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";  -- For OpenAI embeddings

-- =====================================================
-- CUSTOMERS (Müşteriler)
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL, -- Supabase Auth user.id
  email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'CH',
  stripe_customer_id TEXT UNIQUE,
  avatar_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customer data" ON customers
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own customer data" ON customers
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- =====================================================
-- SUBSCRIPTIONS (Abonelikler)
-- =====================================================
CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active', 
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'unpaid',
  'paused'
);

CREATE TYPE subscription_plan AS ENUM (
  'free',
  'basic',
  'pro',
  'enterprise'
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan subscription_plan DEFAULT 'free',
  status subscription_status DEFAULT 'trialing',
  billing_cycle TEXT DEFAULT 'monthly', -- 'monthly' or 'yearly'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- =====================================================
-- AGENT TEMPLATES (Hazır Agent Şablonları)
-- =====================================================
CREATE TABLE agent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  icon TEXT,
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',
  demo_questions TEXT[] DEFAULT '{}',
  integrations TEXT[] DEFAULT '{}',
  base_prompt TEXT,
  price_monthly INTEGER DEFAULT 0, -- in cents (CHF)
  price_yearly INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  user_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CUSTOMER AGENTS (Müşteri Agent'ları)
-- =====================================================
CREATE TYPE agent_status AS ENUM ('draft', 'active', 'paused', 'deleted');

CREATE TABLE customer_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  template_id UUID REFERENCES agent_templates(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  status agent_status DEFAULT 'draft',
  custom_prompt TEXT,
  welcome_message TEXT DEFAULT 'Grüezi! Wie kann ich Ihnen helfen?',
  primary_color TEXT DEFAULT '#ff3b30',
  widget_position TEXT DEFAULT 'bottom-right',
  allowed_domains TEXT[] DEFAULT '{}',
  is_whatsapp_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_number TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE customer_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agents" ON customer_agents
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can create own agents" ON customer_agents
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can update own agents" ON customer_agents
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can delete own agents" ON customer_agents
  FOR DELETE USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- =====================================================
-- KNOWLEDGE BASE (Bilgi Tabanı)
-- =====================================================
CREATE TYPE knowledge_type AS ENUM ('faq', 'document', 'website', 'custom');

-- Note: If pgvector extension is not available, embedding column will be JSONB
-- To use VECTOR type, enable pgvector in Supabase Dashboard > Database > Extensions
DO $$
BEGIN
    -- Try to create table with VECTOR type
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        CREATE TABLE IF NOT EXISTS knowledge_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            agent_id UUID REFERENCES customer_agents(id) ON DELETE CASCADE,
            type knowledge_type DEFAULT 'faq',
            question TEXT,
            answer TEXT,
            content TEXT,
            source_url TEXT,
            file_path TEXT,
            embedding VECTOR(1536), -- OpenAI embedding dimension
            metadata JSONB DEFAULT '{}',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Fallback: use JSONB for embeddings if pgvector not available
        CREATE TABLE IF NOT EXISTS knowledge_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            agent_id UUID REFERENCES customer_agents(id) ON DELETE CASCADE,
            type knowledge_type DEFAULT 'faq',
            question TEXT,
            answer TEXT,
            content TEXT,
            source_url TEXT,
            file_path TEXT,
            embedding JSONB, -- Fallback: store as JSON array
            metadata JSONB DEFAULT '{}',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- RLS Policies
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own knowledge items" ON knowledge_items
  FOR ALL USING (
    agent_id IN (
      SELECT ca.id FROM customer_agents ca
      JOIN customers c ON ca.customer_id = c.id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- =====================================================
-- CONVERSATIONS (Konuşmalar)
-- =====================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES customer_agents(id) ON DELETE CASCADE,
  visitor_id TEXT, -- anonim ziyaretçi id
  visitor_name TEXT,
  visitor_email TEXT,
  channel TEXT DEFAULT 'web', -- 'web', 'whatsapp', 'api'
  status TEXT DEFAULT 'active', -- 'active', 'closed', 'archived'
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public access for widget (no auth required)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view conversations by visitor_id" ON conversations
  FOR SELECT USING (true);

-- =====================================================
-- MESSAGES (Mesajlar)
-- =====================================================
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  tool_calls JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public access for widget
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create messages" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view messages" ON messages
  FOR SELECT USING (true);

-- =====================================================
-- USAGE STATS (Kullanım İstatistikleri)
-- =====================================================
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES customer_agents(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- '2026-01' format
  messages_count INTEGER DEFAULT 0,
  conversations_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(customer_id, agent_id, period)
);

-- RLS Policies
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage stats" ON usage_stats
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- =====================================================
-- INTEGRATIONS (Entegrasyonlar)
-- =====================================================
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'bexio', 'abacus', 'google', etc.
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(customer_id, provider)
);

-- RLS Policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations" ON integrations
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- =====================================================
-- INVOICES (Faturalar - Stripe'dan senkronize)
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  amount_due INTEGER, -- in cents
  amount_paid INTEGER,
  currency TEXT DEFAULT 'chf',
  status TEXT,
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER customer_agents_updated_at
  BEFORE UPDATE ON customer_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER knowledge_items_updated_at
  BEFORE UPDATE ON knowledge_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER usage_stats_updated_at
  BEFORE UPDATE ON usage_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create customer after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (auth_user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to increment usage stats
CREATE OR REPLACE FUNCTION increment_usage(
  p_customer_id UUID,
  p_agent_id UUID,
  p_messages INTEGER DEFAULT 1,
  p_tokens INTEGER DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
  v_period TEXT;
BEGIN
  v_period := TO_CHAR(NOW(), 'YYYY-MM');
  
  INSERT INTO usage_stats (customer_id, agent_id, period, messages_count, tokens_used)
  VALUES (p_customer_id, p_agent_id, v_period, p_messages, p_tokens)
  ON CONFLICT (customer_id, agent_id, period)
  DO UPDATE SET
    messages_count = usage_stats.messages_count + p_messages,
    tokens_used = usage_stats.tokens_used + p_tokens,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription limits
CREATE OR REPLACE FUNCTION get_subscription_limits(p_plan subscription_plan)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE p_plan
    WHEN 'free' THEN '{"messages": 100, "agents": 1, "integrations": 0}'::JSONB
    WHEN 'basic' THEN '{"messages": 5000, "agents": 1, "integrations": 0}'::JSONB
    WHEN 'pro' THEN '{"messages": 15000, "agents": 3, "integrations": 5}'::JSONB
    WHEN 'enterprise' THEN '{"messages": -1, "agents": -1, "integrations": -1}'::JSONB
    ELSE '{"messages": 100, "agents": 1, "integrations": 0}'::JSONB
  END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_customer_agents_customer ON customer_agents(customer_id);
CREATE INDEX idx_customer_agents_status ON customer_agents(status);
CREATE INDEX idx_conversations_agent ON conversations(agent_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_usage_stats_period ON usage_stats(period);

-- =====================================================
-- INITIAL DATA (Agent Templates)
-- =====================================================
INSERT INTO agent_templates (slug, name, description, long_description, icon, category, category_slug, features, use_cases, demo_questions, integrations, price_monthly, price_yearly, is_popular, is_new, rating, user_count) VALUES

('treuhand-assistent', 'Treuhand Assistent', 
'Intelligente Unterstützung für Treuhandbüros und Steuerberater',
'Der Treuhand Assistent beantwortet alle Fragen rund um MWST, Steuern, Buchhaltung und mehr. Er kennt die Schweizer Steuergesetze und kann Ihre Mandanten rund um die Uhr betreuen.',
'📊', 'Treuhand & Finanzen', 'treuhand',
ARRAY['MWST-Fristen und Abrechnungsfragen', 'Lohnbuchhaltung FAQ (AHV, BVG, UVG)', 'Automatische Fristen-Erinnerungen', 'Dokumenten-Checklisten für Steuererklärung', 'Neukunden-Onboarding', 'Bexio & Abacus Integration ready'],
ARRAY['Mandanten fragen nach MWST-Terminen', 'Neue Kunden benötigen Unterlagen-Checkliste', 'Fragen zu Sozialversicherungen', 'Terminvereinbarungen für Beratungen'],
ARRAY['Wann ist die nächste MWST-Abrechnung fällig?', 'Welche Unterlagen brauche ich für die Steuererklärung?', 'Wie funktioniert die AHV-Abrechnung?'],
ARRAY['Bexio', 'Abacus', 'KLARA', 'Microsoft 365'],
34900, 349000, true, false, 4.9, 156),

('elektro-assistent', 'Elektro Assistent',
'24/7 Kundenservice für Elektrofachbetriebe',
'Der Elektro Assistent bearbeitet Anfragen zu Installationen, Reparaturen und Notfällen. Er kann Termine koordinieren und Kostenvoranschläge vorbereiten.',
'⚡', 'Handwerk & Gewerbe', 'handwerk',
ARRAY['Notfall-Hotline Weiterleitung', 'Terminvereinbarung für Installationen', 'Kostenvoranschläge vorbereiten', 'Produktberatung (Beleuchtung, Smart Home)', 'Wartungsverträge erklären'],
ARRAY['Kunde meldet Stromausfall am Wochenende', 'Anfrage für Solaranlagen-Installation', 'Fragen zu Smart Home Lösungen', 'Termin für Elektro-Check vereinbaren'],
ARRAY['Ich habe einen Stromausfall, was soll ich tun?', 'Was kostet eine Steckdose installieren?', 'Bieten Sie Smart Home Lösungen an?'],
ARRAY['Bexio', 'Microsoft 365', 'Google Calendar'],
29900, 299000, true, false, 4.8, 89),

('restaurant-assistent', 'Restaurant Assistent',
'Tischreservierungen und Kundenservice für Gastronomie',
'Der Restaurant Assistent nimmt Reservierungen entgegen, informiert über Menüs und Öffnungszeiten und beantwortet häufige Fragen.',
'🍽️', 'Gastronomie & Hotellerie', 'gastronomie',
ARRAY['Online Tischreservierung', 'Menükarten und Tagesempfehlungen', 'Allergie-Informationen', 'Öffnungszeiten und Anfahrt', 'Eventanfragen bearbeiten', 'Feedback sammeln'],
ARRAY['Gast möchte Tisch reservieren', 'Fragen zu vegetarischen Optionen', 'Anfrage für Firmenanlass', 'Beschwerdemanagement'],
ARRAY['Haben Sie heute Abend noch einen Tisch für 4 Personen?', 'Welche veganen Gerichte haben Sie?', 'Kann man bei Ihnen Geburtstag feiern?'],
ARRAY['OpenTable', 'Google Business', 'Facebook'],
24900, 249000, false, true, 4.7, 67),

('zahnarzt-assistent', 'Zahnarzt Assistent',
'Terminmanagement und Patientenservice für Zahnarztpraxen',
'Der Zahnarzt Assistent koordiniert Termine, beantwortet Fragen zu Behandlungen und hilft Patienten bei der Vorbereitung.',
'🦷', 'Gesundheit & Wellness', 'gesundheit',
ARRAY['Online Terminbuchung', 'Behandlungsinfos (Prophylaxe, Implantate)', 'Versicherungsfragen klären', 'Notfall-Triage', 'Recall-Erinnerungen', 'Nachsorge-Informationen'],
ARRAY['Patient möchte Kontrolltermin buchen', 'Fragen zu Zahnimplantat-Kosten', 'Notfall: Zahnschmerzen am Wochenende', 'Krankenkassen-Deckung prüfen'],
ARRAY['Ich möchte einen Termin für eine Kontrolle', 'Was kostet eine professionelle Zahnreinigung?', 'Ich habe starke Zahnschmerzen, was soll ich tun?'],
ARRAY['Doctolib', 'OneDoc', 'Microsoft 365'],
34900, 349000, false, false, 4.9, 45);


