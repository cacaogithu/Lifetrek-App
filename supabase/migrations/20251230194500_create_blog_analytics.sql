-- Blog Analytics System - Database Migration
-- Enables tracking of blog post engagement and ICP identification
-- Part of blog strategy enhancement for Lifetrek Medical

-- =====================================================
-- 1. BLOG ANALYTICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Post reference
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  
  -- User identification (anonymous by default)
  session_id TEXT NOT NULL, -- Browser session from localStorage
  user_email TEXT, -- If available from UTM params or login
  company_domain TEXT, -- Extracted from email or reverse IP lookup
  
  -- Engagement metrics
  viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  time_on_page INTEGER, -- Seconds spent on page
  scroll_depth INTEGER, -- Percentage scrolled (0-100)
  cta_clicked BOOLEAN DEFAULT FALSE, -- Did user click contact CTA?
  
  -- Traffic source tracking
  utm_source TEXT, -- e.g., 'linkedin', 'email', 'organic'
  utm_medium TEXT, -- e.g., 'social', 'email', 'cpc'
  utm_campaign TEXT, -- e.g., 'iso-13485-launch'
  utm_content TEXT, -- e.g., 'cta-button-1'
  referrer TEXT, -- Document referrer URL
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 2. BLOG LEAD ATTRIBUTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_lead_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Lead identification
  lead_email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  company_domain TEXT,
  
  -- Blog engagement summary
  first_blog_post UUID REFERENCES blog_posts(id),
  first_visited_at TIMESTAMPTZ,
  total_posts_viewed INTEGER DEFAULT 0,
  avg_time_on_page INTEGER, -- Average seconds across all posts
  avg_scroll_depth INTEGER, -- Average scroll percentage
  total_cta_clicks INTEGER DEFAULT 0,
  
  -- Content preferences
  favorite_category TEXT, -- Most-viewed category slug
  favorite_keywords TEXT[], -- Most common keywords from posts read
  
  -- Lead conversion tracking
  converted_to_lead_at TIMESTAMPTZ, -- When they filled contact form
  lead_source TEXT, -- 'blog', 'direct', 'referral'
  
  -- CRM integration (future)
  crm_lead_id TEXT, -- External CRM ID
  deal_value DECIMAL, -- If deal closed, value in BRL
  deal_stage TEXT, -- 'prospect', 'qualified', 'proposal', 'closed-won', 'closed-lost'
  deal_closed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 3. NEWS DIGEST TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS news_digest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- News content from Perplexity
  content TEXT NOT NULL, -- Formatted summary of news items
  sources TEXT[] DEFAULT '{}', -- URLs of news sources
  
  -- Customer interest tracking
  customer_interests TEXT[], -- Keywords that prompted this search
  search_query TEXT, -- Exact query sent to Perplexity
  
  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Content generation tracking
  blog_posts_created UUID[], -- Posts generated from this news digest
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Blog Analytics indexes
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON blog_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_session_id ON blog_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_company_domain ON blog_analytics(company_domain) WHERE company_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_analytics_viewed_at ON blog_analytics(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_utm_source ON blog_analytics(utm_source) WHERE utm_source IS NOT NULL;

-- Blog Lead Attribution indexes
CREATE INDEX IF NOT EXISTS idx_blog_lead_attribution_email ON blog_lead_attribution(lead_email);
CREATE INDEX IF NOT EXISTS idx_blog_lead_attribution_company ON blog_lead_attribution(company_domain) WHERE company_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_lead_attribution_deal_value ON blog_lead_attribution(deal_value DESC NULLS LAST);

-- GIN indexes for array fields
CREATE INDEX IF NOT EXISTS idx_blog_lead_attribution_keywords ON blog_lead_attribution USING GIN(favorite_keywords);
CREATE INDEX IF NOT EXISTS idx_news_digest_interests ON news_digest USING GIN(customer_interests);
CREATE INDEX IF NOT EXISTS idx_news_digest_sources ON news_digest USING GIN(sources);

-- News Digest indexes
CREATE INDEX IF NOT EXISTS idx_news_digest_generated_at ON news_digest(generated_at DESC);

-- =====================================================
-- 5. AUTO-UPDATE TIMESTAMPS
-- =====================================================

CREATE TRIGGER blog_analytics_updated_at
  BEFORE UPDATE ON blog_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

CREATE TRIGGER blog_lead_attribution_updated_at
  BEFORE UPDATE ON blog_lead_attribution
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE blog_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_lead_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_digest ENABLE ROW LEVEL SECURITY;

-- Public: Can insert analytics (anonymous tracking)
CREATE POLICY "Public can insert blog analytics"
  ON blog_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Public: Can update their own session analytics
CREATE POLICY "Public can update own session analytics"
  ON blog_analytics
  FOR UPDATE
  TO public
  USING (true) -- Allow updates (we trust client-side session_id)
  WITH CHECK (true);

-- Admins: Full read access to analytics
CREATE POLICY "Admins can view all blog analytics"
  ON blog_analytics
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admins: Full access to lead attribution
CREATE POLICY "Admins have full access to lead attribution"
  ON blog_lead_attribution
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins: Full access to news digest
CREATE POLICY "Admins have full access to news digest"
  ON news_digest
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Service role: Full access (for cron jobs and edge functions)
CREATE POLICY "Service role full access to news digest"
  ON news_digest
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 7. HELPER FUNCTION: EXTRACT DOMAIN FROM EMAIL
-- =====================================================

CREATE OR REPLACE FUNCTION extract_domain_from_email(email TEXT)
RETURNS TEXT AS $$
BEGIN
  IF email IS NULL OR email !~ '@' THEN
    RETURN NULL;
  END IF;
  
  RETURN LOWER(SPLIT_PART(email, '@', 2));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 8. COMMENTS
-- =====================================================

COMMENT ON TABLE blog_analytics IS 'Tracks individual blog post views and engagement metrics for analytics and ICP identification';
COMMENT ON TABLE blog_lead_attribution IS 'Aggregates blog engagement data per lead with CRM integration fields';
COMMENT ON TABLE news_digest IS 'Stores weekly industry news from Perplexity API based on customer interests';
COMMENT ON COLUMN blog_analytics.session_id IS 'Browser session ID from localStorage for anonymous tracking';
COMMENT ON COLUMN blog_analytics.time_on_page IS 'Seconds spent on page (tracked via beforeunload event)';
COMMENT ON COLUMN blog_analytics.scroll_depth IS 'Percentage of page scrolled (0-100)';
COMMENT ON COLUMN blog_lead_attribution.deal_value IS 'Deal value in BRL if closed-won';
