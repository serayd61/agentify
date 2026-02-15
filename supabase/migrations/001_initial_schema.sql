-- ================================================
-- AGENTIFY.CH - Supabase Database Schema
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- CUSTOMERS (linked to Supabase Auth)
-- ================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  industry TEXT,
  language TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- SUBSCRIPTIONS (Stripe-linked)
-- ================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL DEFAULT 'starter', -- starter, business, enterprise
  status TEXT NOT NULL DEFAULT 'trialing', -- trialing, active, past_due, canceled
  price_monthly INTEGER NOT NULL DEFAULT 19900, -- in cents CHF
  agent_limit INTEGER NOT NULL DEFAULT 1,
  message_limit INTEGER NOT NULL DEFAULT 2500,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- AGENT TEMPLATES (marketplace catalog)
-- ================================================
CREATE TABLE IF NOT EXISTS agent_templates (
  id TEXT PRIMARY KEY, -- e.g. 'treuhand', 'elektro'
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  system_prompt TEXT NOT NULL, -- The AI personality/instructions
  knowledge_base JSONB DEFAULT '[]'::jsonb, -- FAQ pairs, domain knowledge
  default_settings JSONB DEFAULT '{}'::jsonb,
  price_monthly INTEGER NOT NULL DEFAULT 24900,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- CUSTOMER AGENTS (provisioned instances)
-- ================================================
CREATE TABLE IF NOT EXISTS customer_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES agent_templates(id),
  name TEXT NOT NULL,
  icon TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, suspended
  -- Custom overrides
  custom_prompt TEXT, -- Optional override of template system_prompt
  custom_knowledge JSONB DEFAULT '[]'::jsonb, -- Customer-added FAQ
  custom_settings JSONB DEFAULT '{}'::jsonb, -- branding, greeting, etc.
  -- Widget config
  api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  widget_color TEXT DEFAULT '#dc2626',
  widget_position TEXT DEFAULT 'bottom-right',
  allowed_domains TEXT[] DEFAULT '{}',
  -- Stats
  message_count INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- CONVERSATIONS
-- ================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES customer_agents(id) ON DELETE CASCADE,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  source TEXT DEFAULT 'widget', -- widget, whatsapp, api
  status TEXT DEFAULT 'open', -- open, closed, escalated
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- MESSAGES
-- ================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_customers_auth ON customers(auth_user_id);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_customer_agents_customer ON customer_agents(customer_id);
CREATE INDEX idx_customer_agents_template ON customer_agents(template_id);
CREATE INDEX idx_customer_agents_api_key ON customer_agents(api_key);
CREATE INDEX idx_conversations_agent ON conversations(agent_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own data
CREATE POLICY "customers_own" ON customers
  FOR ALL USING (auth_user_id = auth.uid());

CREATE POLICY "subscriptions_own" ON subscriptions
  FOR ALL USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "agents_own" ON customer_agents
  FOR ALL USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "conversations_own" ON conversations
  FOR ALL USING (agent_id IN (
    SELECT ca.id FROM customer_agents ca
    JOIN customers c ON ca.customer_id = c.id
    WHERE c.auth_user_id = auth.uid()
  ));

CREATE POLICY "messages_own" ON messages
  FOR ALL USING (conversation_id IN (
    SELECT conv.id FROM conversations conv
    JOIN customer_agents ca ON conv.agent_id = ca.id
    JOIN customers c ON ca.customer_id = c.id
    WHERE c.auth_user_id = auth.uid()
  ));

-- Agent templates are public read
ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_read" ON agent_templates FOR SELECT USING (true);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Auto-create customer on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customers (auth_user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Increment message count
CREATE OR REPLACE FUNCTION increment_message_count(agent_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE customer_agents
  SET message_count = message_count + 1,
      updated_at = NOW()
  WHERE id = agent_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER customer_agents_updated BEFORE UPDATE ON customer_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER conversations_updated BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
