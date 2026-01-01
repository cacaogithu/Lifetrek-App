-- Blog Analytics SQL Functions
-- Provides analytics queries for ICP identification and content performance

-- =====================================================
-- 1. GET TOP CUSTOMER INTERESTS
-- =====================================================

CREATE OR REPLACE FUNCTION get_top_customer_interests(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  keyword TEXT,
  post_count BIGINT,
  avg_engagement_score DECIMAL,
  total_views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH post_keywords AS (
    SELECT 
      bp.id as post_id,
      UNNEST(bp.keywords) as keyword,
      COUNT(DISTINCT ba.session_id) as views,
      AVG(ba.time_on_page) as avg_time,
      AVG(ba.scroll_depth) as avg_scroll
    FROM blog_posts bp
    LEFT JOIN blog_analytics ba ON bp.id = ba.post_id
    WHERE bp.status = 'published'
    GROUP BY bp.id, keyword
  )
  SELECT 
    pk.keyword,
    COUNT(DISTINCT pk.post_id) as post_count,
    ROUND(AVG(
      (COALESCE(pk.avg_time, 0) / 180.0) * 50 + -- Max 50 points for 3+ min
      (COALESCE(pk.avg_scroll, 0) / 100.0) * 30 + -- Max 30 points for 100% scroll
      (pk.views / 10.0) * 20 -- Max 20 points for 10+ views
    ), 2) as avg_engagement_score,
    SUM(pk.views) as total_views
  FROM post_keywords pk
  WHERE pk.keyword IS NOT NULL
  GROUP BY pk.keyword
  ORDER BY avg_engagement_score DESC, total_views DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 2. GET ICP COMPANIES
-- =====================================================

CREATE OR REPLACE FUNCTION get_icp_companies(
  min_posts_read INTEGER DEFAULT 2,
  min_avg_time INTEGER DEFAULT 120 -- seconds
)
RETURNS TABLE(
  company_domain TEXT,
  company_name TEXT,
  posts_read BIGINT,
  avg_time_on_page INTEGER,
  avg_scroll_depth INTEGER,
  total_cta_clicks BIGINT,
  deal_value DECIMAL,
  deal_stage TEXT,
  icp_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH company_engagement AS (
    SELECT 
      ba.company_domain,
      COUNT(DISTINCT ba.post_id) as posts_read,
      ROUND(AVG(ba.time_on_page)) as avg_time,
      ROUND(AVG(ba.scroll_depth)) as avg_scroll,
      COUNT(*) FILTER (WHERE ba.cta_clicked) as cta_clicks
    FROM blog_analytics ba
    WHERE ba.company_domain IS NOT NULL
    GROUP BY ba.company_domain
    HAVING COUNT(DISTINCT ba.post_id) >= min_posts_read
      AND AVG(ba.time_on_page) >= min_avg_time
  )
  SELECT 
    ce.company_domain,
    bla.company_name,
    ce.posts_read,
    ce.avg_time as avg_time_on_page,
    ce.avg_scroll as avg_scroll_depth,
    ce.cta_clicks as total_cta_clicks,
    bla.deal_value,
    bla.deal_stage,
    ROUND(
      (ce.posts_read / 10.0) * 30 + -- 30 points max for reading posts
      (ce.avg_time / 300.0) * 30 + -- 30 points max for 5+ min avg time
      (ce.avg_scroll / 100.0) * 20 + -- 20 points max for high scroll
      (ce.cta_clicks / 5.0) * 10 + -- 10 points max for CTA engagement
      (COALESCE(bla.deal_value, 0) / 100000.0) * 10 -- 10 points max for deal value
    , 2) as icp_score
  FROM company_engagement ce
  LEFT JOIN blog_lead_attribution bla ON ce.company_domain = bla.company_domain
  ORDER BY icp_score DESC, ce.posts_read DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 3. GET CONTENT PERFORMANCE STATS
-- =====================================================

CREATE OR REPLACE FUNCTION get_content_performance_stats()
RETURNS TABLE(
  post_id UUID,
  post_title TEXT,
  post_slug TEXT,
  category_name TEXT,
  total_views BIGINT,
  unique_sessions BIGINT,
  avg_time_on_page INTEGER,
  avg_scroll_depth INTEGER,
  cta_click_rate DECIMAL,
  conversion_count BIGINT,
  performance_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id as post_id,
    bp.title as post_title,
    bp.slug as post_slug,
    bc.name as category_name,
    COUNT(ba.id) as total_views,
    COUNT(DISTINCT ba.session_id) as unique_sessions,
    ROUND(AVG(ba.time_on_page))::INTEGER as avg_time_on_page,
    ROUND(AVG(ba.scroll_depth))::INTEGER as avg_scroll_depth,
    ROUND(
      (COUNT(*) FILTER (WHERE ba.cta_clicked)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
      2
    ) as cta_click_rate,
    COUNT(*) FILTER (WHERE ba.cta_clicked) as conversion_count,
    ROUND(
      (COUNT(DISTINCT ba.session_id) / 100.0) * 30 + -- Views weight
      (AVG(ba.time_on_page) / 180.0) * 30 + -- Time weight
      (AVG(ba.scroll_depth) / 100.0) * 20 + -- Scroll weight
      ((COUNT(*) FILTER (WHERE ba.cta_clicked)::DECIMAL / NULLIF(COUNT(*), 0)) * 100) * 0.2 -- CTR weight
    , 2) as performance_score
  FROM blog_posts bp
  LEFT JOIN blog_categories bc ON bp.category_id = bc.id
  LEFT JOIN blog_analytics ba ON bp.id = ba.post_id
  WHERE bp.status = 'published'
  GROUP BY bp.id, bp.title, bp.slug, bc.name
  HAVING COUNT(ba.id) > 0
  ORDER BY performance_score DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 4. UPDATE LEAD ATTRIBUTION (TRIGGER FUNCTION)
-- =====================================================

CREATE OR REPLACE FUNCTION update_lead_attribution_from_analytics()
RETURNS TRIGGER AS $$
DECLARE
  lead_exists BOOLEAN;
  lead_email TEXT;
BEGIN
  -- Only process if we have user email
  IF NEW.user_email IS NULL THEN
    RETURN NEW;
  END IF;
  
  lead_email := LOWER(NEW.user_email);
  
  -- Check if lead exists
  SELECT EXISTS(
    SELECT 1 FROM blog_lead_attribution WHERE blog_lead_attribution.lead_email = lead_email
  ) INTO lead_exists;
  
  IF NOT lead_exists THEN
    -- Create new lead attribution record
    INSERT INTO blog_lead_attribution (
      lead_email,
      company_domain,
      first_blog_post,
      first_visited_at,
      total_posts_viewed,
      avg_time_on_page,
      avg_scroll_depth,
      total_cta_clicks
    ) VALUES (
      lead_email,
      extract_domain_from_email(lead_email),
      NEW.post_id,
      NEW.viewed_at,
      1,
      COALESCE(NEW.time_on_page, 0),
      COALESCE(NEW.scroll_depth, 0),
      CASE WHEN NEW.cta_clicked THEN 1 ELSE 0 END
    );
  ELSE
    -- Update existing lead attribution
    UPDATE blog_lead_attribution
    SET 
      total_posts_viewed = total_posts_viewed + 1,
      avg_time_on_page = (
        (avg_time_on_page * total_posts_viewed + COALESCE(NEW.time_on_page, 0)) / 
        (total_posts_viewed + 1)
      ),
      avg_scroll_depth = (
        (avg_scroll_depth * total_posts_viewed + COALESCE(NEW.scroll_depth, 0)) / 
        (total_posts_viewed + 1)
      ),
      total_cta_clicks = total_cta_clicks + CASE WHEN NEW.cta_clicked THEN 1 ELSE 0 END,
      updated_at = NOW()
    WHERE blog_lead_attribution.lead_email = lead_email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_lead_attribution ON blog_analytics;
CREATE TRIGGER trigger_update_lead_attribution
  AFTER INSERT OR UPDATE ON blog_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_attribution_from_analytics();

-- =====================================================
-- 5. COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_top_customer_interests IS 'Returns top keywords by engagement score (time + scroll + views)';
COMMENT ON FUNCTION get_icp_companies IS 'Identifies high-value companies based on blog engagement and deal data';
COMMENT ON FUNCTION get_content_performance_stats IS 'Returns performance metrics for all published blog posts';
COMMENT ON FUNCTION update_lead_attribution_from_analytics IS 'Automatically updates lead attribution when new analytics events are recorded';
