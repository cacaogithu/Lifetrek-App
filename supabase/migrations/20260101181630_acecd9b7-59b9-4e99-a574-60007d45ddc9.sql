-- 1. Create Tables
CREATE TABLE IF NOT EXISTS blog_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_email TEXT,
  company_domain TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  time_on_page INTEGER,
  scroll_depth INTEGER,
  cta_clicked BOOLEAN DEFAULT FALSE,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_lead_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  company_domain TEXT,
  first_blog_post UUID REFERENCES blog_posts(id),
  first_visited_at TIMESTAMPTZ,
  total_posts_viewed INTEGER DEFAULT 0,
  avg_time_on_page INTEGER,
  avg_scroll_depth INTEGER,
  total_cta_clicks INTEGER DEFAULT 0,
  favorite_category TEXT,
  favorite_keywords TEXT[],
  converted_to_lead_at TIMESTAMPTZ,
  lead_source TEXT,
  crm_lead_id TEXT,
  deal_value DECIMAL,
  deal_stage TEXT,
  deal_closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS news_digest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  sources TEXT[] DEFAULT '{}',
  customer_interests TEXT[],
  search_query TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  blog_posts_created UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create Indexes
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON blog_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_session_id ON blog_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_company_domain ON blog_analytics(company_domain);
CREATE INDEX IF NOT EXISTS idx_blog_lead_attribution_email ON blog_lead_attribution(lead_email);

-- 3. Enable RLS
ALTER TABLE blog_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_lead_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_digest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert analytics" ON blog_analytics FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update analytics" ON blog_analytics FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access" ON blog_analytics FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access attribution" ON blog_lead_attribution FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access news" ON news_digest FOR ALL TO authenticated USING (true);

-- 4. Create Helper Functions
CREATE OR REPLACE FUNCTION extract_domain_from_email(email TEXT) RETURNS TEXT AS $$
BEGIN
  IF email IS NULL OR email !~ '@' THEN RETURN NULL; END IF;
  RETURN LOWER(SPLIT_PART(email, '@', 2));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_top_customer_interests(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(keyword TEXT, post_count BIGINT, avg_engagement_score DECIMAL, total_views BIGINT) AS $$
BEGIN
  RETURN QUERY SELECT 
      UNNEST(bp.keywords) as keyword,
      COUNT(DISTINCT bp.id) as post_count,
      AVG(ba.time_on_page)::DECIMAL as avg_engagement_score,
      COUNT(ba.id) as total_views
  FROM blog_posts bp
  JOIN blog_analytics ba ON bp.id = ba.post_id
  GROUP BY keyword
  ORDER BY total_views DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;