-- ========================================
-- AGENTIFY.CH - Database Schema
-- Swiss Agent Network Platform
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "vector"; -- Enable in Supabase Dashboard > Extensions

-- ========================================
-- CUSTOMERS (Firmen/Kunden)
-- ========================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  industry TEXT,
  website TEXT,
  address_street TEXT,
  address_city TEXT,
  address_zip TEXT,
  address_country TEXT DEFAULT 'CH',
  stripe_customer_id TEXT,
  language TEXT DEFAULT 'de',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CATEGORIES (Agent-Kategorien)
-- ========================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_de TEXT NOT NULL,
  name_fr TEXT,
  name_en TEXT,
  description_de TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- AGENT TEMPLATES (Vorkonfigurierte Agents)
-- ========================================
CREATE TABLE IF NOT EXISTS agent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  name_de TEXT NOT NULL,
  name_fr TEXT,
  name_en TEXT,
  description_de TEXT NOT NULL,
  long_description_de TEXT,
  icon TEXT,
  features JSONB DEFAULT '[]',
  use_cases JSONB DEFAULT '[]',
  integrations JSONB DEFAULT '[]',
  demo_questions JSONB DEFAULT '[]',
  default_system_prompt TEXT,
  default_knowledge JSONB DEFAULT '{}',
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  user_count INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CUSTOMER AGENTS (Kundenspezifische Agents)
-- ========================================
CREATE TABLE IF NOT EXISTS customer_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  template_id UUID REFERENCES agent_templates(id),
  name TEXT NOT NULL,
  system_prompt TEXT,
  custom_settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  api_key TEXT UNIQUE,
  widget_config JSONB DEFAULT '{}',
  languages TEXT[] DEFAULT ARRAY['de'],
  channels TEXT[] DEFAULT ARRAY['website'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- KNOWLEDGE BASE (Wissensbasis)
-- ========================================
CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES customer_agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('faq', 'document', 'price', 'info', 'contact')),
  title TEXT,
  question TEXT,
  answer TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding JSONB, -- Use JSONB instead of vector for compatibility
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CONVERSATIONS (Gespräche)
-- ========================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES customer_agents(id) ON DELETE CASCADE,
  visitor_id TEXT,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- MESSAGES (Nachrichten)
-- ========================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- USAGE (Nutzungsstatistiken)
-- ========================================
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES customer_agents(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  message_count INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, month)
);

-- ========================================
-- SUBSCRIPTIONS (Abonnements)
-- ========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'business', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  price_monthly DECIMAL(10,2),
  message_limit INTEGER,
  agent_limit INTEGER,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INVOICES (Rechnungen)
-- ========================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_invoice_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CHF',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- WEBHOOKS LOG (für Debugging)
-- ========================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'received',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_customer_agents_customer ON customer_agents(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_agents_status ON customer_agents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_agent ON knowledge_items(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);

-- Add month column to usage_stats if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_stats' AND column_name = 'month') THEN
    ALTER TABLE usage_stats ADD COLUMN month TEXT;
  END IF;
END $$;

-- Create index on usage_stats only if month column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_stats' AND column_name = 'month') THEN
    CREATE INDEX IF NOT EXISTS idx_usage_stats_agent_month ON usage_stats(agent_id, month);
  END IF;
END $$;

-- Vector similarity search index (only if using pgvector)
-- CREATE INDEX IF NOT EXISTS idx_knowledge_embedding ON knowledge_items 
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own data
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Customers can update own data" ON customers;
CREATE POLICY "Customers can update own data" ON customers
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Customer agents policies
DROP POLICY IF EXISTS "Users can view own agents" ON customer_agents;
CREATE POLICY "Users can view own agents" ON customer_agents
  FOR SELECT USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own agents" ON customer_agents;
CREATE POLICY "Users can insert own agents" ON customer_agents
  FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own agents" ON customer_agents;
CREATE POLICY "Users can update own agents" ON customer_agents
  FOR UPDATE USING (customer_id = auth.uid());

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function to increment message count (only works if month column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_stats' AND column_name = 'month') THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION increment_message_count(p_agent_id UUID)
      RETURNS void AS $func$
      DECLARE
        v_month TEXT := to_char(NOW(), ''YYYY-MM'');
      BEGIN
        INSERT INTO usage_stats (agent_id, month, message_count, conversation_count)
        VALUES (p_agent_id, v_month, 1, 0)
        ON CONFLICT (agent_id, month)
        DO UPDATE SET 
          message_count = usage_stats.message_count + 1,
          updated_at = NOW();
      END;
      $func$ LANGUAGE plpgsql SECURITY DEFINER;
    ';
  ELSE
    -- Fallback: simple increment without month tracking
    EXECUTE '
      CREATE OR REPLACE FUNCTION increment_message_count(p_agent_id UUID)
      RETURNS void AS $func$
      BEGIN
        UPDATE usage_stats SET message_count = message_count + 1, updated_at = NOW()
        WHERE agent_id = p_agent_id;
      END;
      $func$ LANGUAGE plpgsql SECURITY DEFINER;
    ';
  END IF;
END $$;

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'sk_' || encode(gen_random_bytes(24), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate API key
CREATE OR REPLACE FUNCTION set_api_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_key IS NULL THEN
    NEW.api_key := generate_api_key();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_api_key ON customer_agents;
CREATE TRIGGER trigger_set_api_key
  BEFORE INSERT ON customer_agents
  FOR EACH ROW
  EXECUTE FUNCTION set_api_key();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_customers_updated ON customers;
CREATE TRIGGER trigger_customers_updated
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_agents_updated ON customer_agents;
CREATE TRIGGER trigger_agents_updated
  BEFORE UPDATE ON customer_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_knowledge_updated ON knowledge_items;
CREATE TRIGGER trigger_knowledge_updated
  BEFORE UPDATE ON knowledge_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_conversations_updated ON conversations;
CREATE TRIGGER trigger_conversations_updated
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- SEED DATA: Categories
-- ========================================
INSERT INTO categories (slug, name_de, icon, sort_order) VALUES
  ('buero', 'Büro & Dienstleistungen', '📊', 1),
  ('handwerk', 'Handwerk & Bau', '🔧', 2),
  ('gesundheit', 'Gesundheit & Wellness', '🏥', 3),
  ('gastro', 'Gastronomie & Hotellerie', '🍽️', 4),
  ('immobilien', 'Immobilien & Verwaltung', '🏠', 5),
  ('auto', 'Auto & Mobilität', '🚗', 6),
  ('tech', 'Tech & Digital', '💻', 7),
  ('handel', 'Handel & Retail', '🛒', 8),
  ('bildung', 'Bildung & Kurse', '📚', 9)
ON CONFLICT (slug) DO NOTHING;
