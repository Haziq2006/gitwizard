-- GitWizard Database Schema
-- Run this in your Supabase SQL editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  github_id TEXT,
  github_access_token TEXT, -- Store GitHub access tokens securely
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  private BOOLEAN DEFAULT false,
  webhook_id BIGINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secret scans table
CREATE TABLE IF NOT EXISTS secret_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  commit_sha TEXT NOT NULL,
  commit_message TEXT NOT NULL,
  commit_url TEXT NOT NULL,
  secret_type TEXT NOT NULL,
  secret_value TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  secret_scan_id UUID REFERENCES secret_scans(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_repositories_github_id ON repositories(github_id);
CREATE INDEX IF NOT EXISTS idx_secret_scans_repository_id ON secret_scans(repository_id);
CREATE INDEX IF NOT EXISTS idx_secret_scans_created_at ON secret_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Repositories policies
CREATE POLICY "Users can view own repositories" ON repositories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own repositories" ON repositories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repositories" ON repositories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own repositories" ON repositories
  FOR DELETE USING (auth.uid() = user_id);

-- Secret scans policies
CREATE POLICY "Users can view scans from own repositories" ON secret_scans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = secret_scans.repository_id 
      AND repositories.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert scans" ON secret_scans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update scans from own repositories" ON secret_scans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = secret_scans.repository_id 
      AND repositories.user_id = auth.uid()
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view own alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts" ON alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own alerts" ON alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Webhook events policies
CREATE POLICY "Users can view events from own repositories" ON webhook_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = webhook_events.repository_id 
      AND repositories.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert webhook events" ON webhook_events
  FOR INSERT WITH CHECK (true);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at BEFORE UPDATE ON repositories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_secret_scans_updated_at BEFORE UPDATE ON secret_scans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_uuid UUID)
RETURNS TABLE (
  total_repositories BIGINT,
  total_scans BIGINT,
  secrets_found BIGINT,
  resolved_secrets BIGINT,
  active_alerts BIGINT,
  scan_success_rate INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_repos AS (
    SELECT id FROM repositories WHERE user_id = user_uuid
  ),
  repo_scans AS (
    SELECT COUNT(*) as scan_count
    FROM secret_scans 
    WHERE repository_id IN (SELECT id FROM user_repos)
  ),
  repo_secrets AS (
    SELECT COUNT(*) as secret_count
    FROM secret_scans 
    WHERE repository_id IN (SELECT id FROM user_repos)
  ),
  resolved_secrets AS (
    SELECT COUNT(*) as resolved_count
    FROM secret_scans 
    WHERE repository_id IN (SELECT id FROM user_repos)
    AND is_resolved = true
  ),
  active_alerts AS (
    SELECT COUNT(*) as alert_count
    FROM alerts 
    WHERE user_id = user_uuid
    AND status = 'pending'
  )
  SELECT 
    (SELECT COUNT(*) FROM user_repos)::BIGINT,
    (SELECT scan_count FROM repo_scans),
    (SELECT secret_count FROM repo_secrets),
    (SELECT resolved_count FROM resolved_secrets),
    (SELECT alert_count FROM active_alerts),
    CASE 
      WHEN (SELECT secret_count FROM repo_secrets) = 0 THEN 95
      ELSE GREATEST(0, LEAST(100, 
        ROUND(
          ((SELECT resolved_count FROM resolved_secrets)::DECIMAL / 
           (SELECT secret_count FROM repo_secrets)::DECIMAL) * 100
        )
      ))
    END::INTEGER;
END;
$$ LANGUAGE plpgsql; 