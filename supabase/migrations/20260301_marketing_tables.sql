-- Marketing Automation Tables
-- Tracks jobs triggered via Modal webhooks and campaign settings

-- Marketing job tracking table
CREATE TABLE IF NOT EXISTS marketing_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_type      TEXT NOT NULL CHECK (job_type IN ('lead_scrape', 'proposal', 'email_automation', 'gmaps_pipeline')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  modal_slug    TEXT,
  input_params  JSONB DEFAULT '{}',
  result        JSONB,
  error         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at  TIMESTAMPTZ
);

-- Campaign knowledge base table (mirrors Instantly campaign config)
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id      TEXT NOT NULL,
  campaign_name    TEXT NOT NULL,
  knowledge_base   TEXT DEFAULT '',
  reply_examples   TEXT DEFAULT '',
  autoreply_active BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, campaign_id)
);

-- Enable Row Level Security
ALTER TABLE marketing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see and modify their own rows
CREATE POLICY "Users manage own marketing_jobs"
  ON marketing_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own marketing_campaigns"
  ON marketing_campaigns FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_marketing_jobs_user_status
  ON marketing_jobs(user_id, status);

CREATE INDEX IF NOT EXISTS idx_marketing_jobs_created_at
  ON marketing_jobs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user
  ON marketing_campaigns(user_id);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketing_jobs_updated_at
  BEFORE UPDATE ON marketing_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
