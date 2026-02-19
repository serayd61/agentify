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
-- SUPABASE EXTENSIONS / MIGRATIONS
-- ========================================

-- Stripe fields for agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS messages_used INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS subscription_start DATE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS subscription_end DATE;

-- Stripe fields for customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS current_package_id UUID REFERENCES packages(id);

-- Lead capture table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  name VARCHAR(200),
  email VARCHAR(200),
  phone VARCHAR(50),
  message TEXT,
  source VARCHAR(50) DEFAULT 'widget',
  status VARCHAR(20) DEFAULT 'new',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (customer_id = auth.uid());

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  date DATE NOT NULL,
  time TIME NOT NULL,
  service VARCHAR(200),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (customer_id = auth.uid());

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
-- ========================================
-- SECTORS (Sektoren für Branchenpakete)
-- ========================================
CREATE TABLE IF NOT EXISTS sectors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name_de VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  icon VARCHAR(50),
  description_de TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO sectors (slug, name_de, icon, sort_order) VALUES
  ('treuhand', 'Treuhand & Buchhaltung', '📊', 1),
  ('handwerk', 'Handwerk & Gewerbe', '🔧', 2),
  ('gastronomie', 'Gastronomie & Hotellerie', '🍽️', 3),
  ('gesundheit', 'Gesundheit & Praxen', '🏥', 4),
  ('immobilien', 'Immobilien & Verwaltung', '🏠', 5),
  ('rechtsberatung', 'Rechtsberatung & Kanzleien', '⚖️', 6)
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- PACKAGES (Sektör bazlı planlar)
-- ========================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('starter', 'business', 'enterprise')),
  name_de VARCHAR(100) NOT NULL,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER,
  messages_per_month INTEGER NOT NULL,
  assistants_count INTEGER NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  stripe_price_id_monthly VARCHAR(100),
  stripe_price_id_yearly VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (sector_id, tier)
);

-- ========================================
-- PACKAGE FEATURES
-- ========================================
CREATE TABLE IF NOT EXISTS package_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL,
  feature_name_de VARCHAR(200) NOT NULL,
  feature_name_en VARCHAR(200),
  is_included BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- ========================================
-- AGENTS & CONTENT (Gerekli ek tablolar zaten var)
-- ========================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES sectors(id),
  package_id UUID REFERENCES packages(id),
  customer_agent_id UUID REFERENCES customer_agents(id),
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'cancelled')),
  config JSONB DEFAULT '{}',
  widget_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  content_key VARCHAR(100) NOT NULL,
  content_value_de TEXT,
  content_value_en TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (agent_id, content_type, content_key)
);

-- ========================================
-- SECTOR PACKAGES
-- ========================================
-- Helper to insert per sector packages

INSERT INTO packages (sector_id, tier, name_de, price_monthly, price_yearly, messages_per_month, assistants_count, is_popular)
VALUES
((SELECT id FROM sectors WHERE slug = 'treuhand'), 'starter', 'Starter', 249, 2490, 2000, 1, false),
((SELECT id FROM sectors WHERE slug = 'treuhand'), 'business', 'Business', 499, 4990, 8000, 3, true),
((SELECT id FROM sectors WHERE slug = 'treuhand'), 'enterprise', 'Enterprise', 999, 9990, 30000, -1, false)
ON CONFLICT (sector_id, tier) DO NOTHING;

INSERT INTO packages (sector_id, tier, name_de, price_monthly, price_yearly, messages_per_month, assistants_count, is_popular)
VALUES
((SELECT id FROM sectors WHERE slug = 'handwerk'), 'starter', 'Starter', 199, 1990, 2500, 1, false),
((SELECT id FROM sectors WHERE slug = 'handwerk'), 'business', 'Business', 399, 3990, 10000, 3, true),
((SELECT id FROM sectors WHERE slug = 'handwerk'), 'enterprise', 'Enterprise', 799, 7990, 40000, -1, false)
ON CONFLICT (sector_id, tier) DO NOTHING;

INSERT INTO packages (sector_id, tier, name_de, price_monthly, price_yearly, messages_per_month, assistants_count, is_popular)
VALUES
((SELECT id FROM sectors WHERE slug = 'gastronomie'), 'starter', 'Starter', 149, 1490, 3000, 1, false),
((SELECT id FROM sectors WHERE slug = 'gastronomie'), 'business', 'Business', 299, 2990, 12000, 2, true),
((SELECT id FROM sectors WHERE slug = 'gastronomie'), 'enterprise', 'Enterprise', 599, 5990, 50000, -1, false)
ON CONFLICT (sector_id, tier) DO NOTHING;

INSERT INTO packages (sector_id, tier, name_de, price_monthly, price_yearly, messages_per_month, assistants_count, is_popular)
VALUES
((SELECT id FROM sectors WHERE slug = 'gesundheit'), 'starter', 'Starter', 299, 2990, 1500, 1, false),
((SELECT id FROM sectors WHERE slug = 'gesundheit'), 'business', 'Business', 599, 5990, 6000, 3, true),
((SELECT id FROM sectors WHERE slug = 'gesundheit'), 'enterprise', 'Enterprise', 1199, 11990, 25000, -1, false)
ON CONFLICT (sector_id, tier) DO NOTHING;

INSERT INTO packages (sector_id, tier, name_de, price_monthly, price_yearly, messages_per_month, assistants_count, is_popular)
VALUES
((SELECT id FROM sectors WHERE slug = 'immobilien'), 'starter', 'Starter', 249, 2490, 2000, 1, false),
((SELECT id FROM sectors WHERE slug = 'immobilien'), 'business', 'Business', 499, 4990, 8000, 3, true),
((SELECT id FROM sectors WHERE slug = 'immobilien'), 'enterprise', 'Enterprise', 999, 9990, 35000, -1, false)
ON CONFLICT (sector_id, tier) DO NOTHING;

INSERT INTO packages (sector_id, tier, name_de, price_monthly, price_yearly, messages_per_month, assistants_count, is_popular)
VALUES
((SELECT id FROM sectors WHERE slug = 'rechtsberatung'), 'starter', 'Starter', 299, 2990, 1000, 1, false),
((SELECT id FROM sectors WHERE slug = 'rechtsberatung'), 'business', 'Business', 599, 5990, 4000, 2, true),
((SELECT id FROM sectors WHERE slug = 'rechtsberatung'), 'enterprise', 'Enterprise', 1199, 11990, 15000, -1, false)
ON CONFLICT (sector_id, tier) DO NOTHING;

-- ========================================
-- PACKAGE FEATURES
-- ========================================
-- Treuhand features per tier
INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, is_highlighted, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, f.is_included, COALESCE(f.is_highlighted, false), f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('faq', 'FAQ-Antworten', true, false, 1),
    ('appointment', 'Terminbuchung', false, false, 2),
    ('bexio', 'Bexio-Integration', false, false, 3),
    ('document', 'Dokumenten-Upload', false, false, 4),
    ('portal', 'Kundenportal', false, false, 5),
    ('whatsapp', 'WhatsApp-Integration', false, false, 6),
    ('priority_support', 'Priority Support', false, false, 7)
) AS f(feature_key, feature_name_de, is_included, is_highlighted, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'treuhand')
  AND p.tier = 'starter'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, is_highlighted, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, f.is_included, f.is_highlighted, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('faq', 'FAQ-Antworten', true, false, 1),
    ('appointment', 'Terminbuchung', true, true, 2),
    ('bexio', 'Bexio-Integration', true, true, 3),
    ('document', 'Dokumenten-Upload', false, false, 4),
    ('portal', 'Kundenportal', false, false, 5),
    ('whatsapp', 'WhatsApp-Integration', true, true, 6),
    ('priority_support', 'Priority Support', true, false, 7)
) AS f(feature_key, feature_name_de, is_included, is_highlighted, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'treuhand')
  AND p.tier = 'business'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, is_highlighted, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, true, COALESCE(f.is_highlighted, false), f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('faq', 'FAQ-Antworten', false, 1),
    ('appointment', 'Terminbuchung', false, 2),
    ('bexio', 'Bexio-Integration', false, 3),
    ('document', 'Dokumenten-Upload', true, 4),
    ('portal', 'Kundenportal', true, 5),
    ('whatsapp', 'WhatsApp-Integration', false, 6),
    ('priority_support', 'Dedicated Support', true, 7),
    ('api', 'API-Zugang', true, 8),
    ('custom', 'Custom Integrationen', true, 9)
) AS f(feature_key, feature_name_de, is_highlighted, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'treuhand')
  AND p.tier = 'enterprise'
ON CONFLICT DO NOTHING;

-- Placeholder for other sectors: similar inserts adapt features per sector.
-- Handwerk features
INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, f.is_included, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('faq', 'FAQ-Antworten', true, 1),
    ('appointment', 'Terminbuchung', true, 2),
    ('emergency_routing', 'Notfall-Routing', false, 3),
    ('whatsapp', 'WhatsApp-Integration', true, 4),
    ('photo_upload', 'Foto-Upload', false, 5),
    ('gps_location', 'GPS-Ortung', false, 6),
    ('priority_support', 'Priority Support', false, 7)
) AS f(feature_key, feature_name_de, is_included, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'handwerk') AND p.tier = 'starter'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, true, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('faq', 'FAQ-Antworten', 1),
    ('appointment', 'Terminbuchung', 2),
    ('emergency_routing', 'Notfall-Routing', 3),
    ('whatsapp', 'WhatsApp-Integration', 4),
    ('photo_upload', 'Foto-Upload', 5),
    ('gps_location', 'GPS-Ortung', 6),
    ('priority_support', 'Priority Support', 7)
) AS f(feature_key, feature_name_de, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'handwerk') AND p.tier = 'business'
ON CONFLICT DO NOTHING;

-- Gastronomie
INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, f.is_included, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('menu_info', 'Menü-Infos', true, 1),
    ('reservation', 'Reservationssystem', true, 2),
    ('dietary_filter', 'Ernährungsfilter', false, 3),
    ('whatsapp_order', 'WhatsApp-Bestellungen', false, 4),
    ('event_management', 'Event-Management', false, 5),
    ('priority_support', 'Priority Support', false, 6)
) AS f(feature_key, feature_name_de, is_included, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'gastronomie') AND p.tier = 'starter'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, true, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('menu_info', 'Menü-Infos', 1),
    ('reservation', 'Reservationssystem', 2),
    ('dietary_filter', 'Ernährungsfilter', 3),
    ('whatsapp_order', 'WhatsApp-Bestellungen', 4),
    ('event_management', 'Event-Management', 5),
    ('priority_support', 'Priority Support', 6)
) AS f(feature_key, feature_name_de, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'gastronomie') AND p.tier = 'business'
ON CONFLICT DO NOTHING;

-- Gesundheit
INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, f.is_included, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('faq', 'FAQ-Antworten', true, 1),
    ('appointment', 'Terminbuchung', true, 2),
    ('insurance_check', 'Versicherungscheck', false, 3),
    ('emergency_routing', 'Notfall-Routing', false, 4),
    ('prescription_reminder', 'Rezept-Erinnerung', false, 5),
    ('patient_portal', 'Patientenportal', false, 6),
    ('priority_support', 'Priority Support', false, 7)
) AS f(feature_key, feature_name_de, is_included, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'gesundheit') AND p.tier = 'starter'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, true, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('faq', 'FAQ-Antworten', 1),
    ('appointment', 'Terminbuchung', 2),
    ('insurance_check', 'Versicherungscheck', 3),
    ('emergency_routing', 'Notfall-Routing', 4),
    ('prescription_reminder', 'Rezept-Erinnerung', 5),
    ('patient_portal', 'Patientenportal', 6),
    ('priority_support', 'Priority Support', 7)
) AS f(feature_key, feature_name_de, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'gesundheit') AND p.tier = 'business'
ON CONFLICT DO NOTHING;

-- Immobilien
INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, f.is_included, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('property_info', 'Immobilien-Info', true, 1),
    ('viewing_appointment', 'Besichtigungstermine', true, 2),
    ('virtual_tour', 'Virtuelle Tour', false, 3),
    ('lead_capture', 'Lead-Erfassung', false, 4),
    ('crm_integration', 'CRM-Integration', false, 5),
    ('priority_support', 'Priority Support', false, 6)
) AS f(feature_key, feature_name_de, is_included, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'immobilien') AND p.tier = 'starter'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, true, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('property_info', 'Immobilien-Info', 1),
    ('viewing_appointment', 'Besichtigungstermine', 2),
    ('virtual_tour', 'Virtuelle Tour', 3),
    ('lead_capture', 'Lead-Erfassung', 4),
    ('crm_integration', 'CRM-Integration', 5),
    ('priority_support', 'Priority Support', 6)
) AS f(feature_key, feature_name_de, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'immobilien') AND p.tier = 'business'
ON CONFLICT DO NOTHING;

-- Rechtsberatung
INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, f.is_included, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('expertise_info', 'Expertise-Info', true, 1),
    ('consultation_booking', 'Beratung buchen', true, 2),
    ('document_review', 'Dokumentenprüfung', false, 3),
    ('privacy_mode', 'Privacy-Modus', false, 4),
    ('case_portal', 'Mandantenportal', false, 5),
    ('priority_support', 'Priority Support', false, 6)
) AS f(feature_key, feature_name_de, is_included, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'rechtsberatung') AND p.tier = 'starter'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_id, feature_key, feature_name_de, is_included, sort_order)
SELECT p.id, f.feature_key, f.feature_name_de, true, f.sort_order
FROM packages p CROSS JOIN (
  VALUES
    ('expertise_info', 'Expertise-Info', 1),
    ('consultation_booking', 'Beratung buchen', 2),
    ('document_review', 'Dokumentenprüfung', 3),
    ('privacy_mode', 'Privacy-Modus', 4),
    ('case_portal', 'Mandantenportal', 5),
    ('priority_support', 'Priority Support', 6)
) AS f(feature_key, feature_name_de, sort_order)
WHERE p.sector_id = (SELECT id FROM sectors WHERE slug = 'rechtsberatung') AND p.tier = 'business'
ON CONFLICT DO NOTHING;
-- ========================================
-- RLS FOR SECTORS AND PACKAGES
-- ========================================
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public sectors" ON sectors
  FOR SELECT USING (is_active);

CREATE POLICY "Users can read packages" ON packages
  FOR SELECT USING (true);

CREATE POLICY "Users can read package features" ON package_features
  FOR SELECT USING (true);
