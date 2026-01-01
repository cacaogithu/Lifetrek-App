-- Fix function search paths for security
CREATE OR REPLACE FUNCTION extract_domain_from_email(email TEXT) RETURNS TEXT 
LANGUAGE plpgsql 
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF email IS NULL OR email !~ '@' THEN RETURN NULL; END IF;
  RETURN LOWER(SPLIT_PART(email, '@', 2));
END;
$$;

CREATE OR REPLACE FUNCTION get_top_customer_interests(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(keyword TEXT, post_count BIGINT, avg_engagement_score DECIMAL, total_views BIGINT) 
LANGUAGE plpgsql 
STABLE
SET search_path = public
AS $$
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
$$;