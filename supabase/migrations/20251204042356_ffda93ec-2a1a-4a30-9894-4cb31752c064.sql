-- Convert security definer views to security invoker
-- This ensures views respect RLS policies of underlying tables

-- Drop and recreate lead_analytics_detailed as security invoker
DROP VIEW IF EXISTS public.lead_analytics_detailed;
CREATE VIEW public.lead_analytics_detailed 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  email,
  company,
  phone,
  annual_volume,
  priority,
  status,
  project_types,
  created_at,
  updated_at,
  DATE(created_at) as lead_date,
  TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-WW') as time_bucket,
  CASE WHEN status = 'closed' THEN true ELSE false END as is_converted
FROM public.contact_leads;

-- Drop and recreate project_type_distribution as security invoker
DROP VIEW IF EXISTS public.project_type_distribution;
CREATE VIEW public.project_type_distribution
WITH (security_invoker = true)
AS
SELECT 
  unnest(project_types) as project_type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE status = 'closed') as converted_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'closed')::numeric / NULLIF(COUNT(*)::numeric, 0) * 100, 
    2
  ) as conversion_rate
FROM public.contact_leads
GROUP BY unnest(project_types);

-- Drop and recreate lead_metrics_by_period as security invoker
DROP VIEW IF EXISTS public.lead_metrics_by_period;
CREATE VIEW public.lead_metrics_by_period
WITH (security_invoker = true)
AS
SELECT 
  DATE_TRUNC('week', created_at) as period,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'new') as new_leads,
  COUNT(*) FILTER (WHERE status IN ('contacted', 'in_progress', 'quoted')) as active_leads,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_leads,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_leads,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'closed')::numeric / NULLIF(COUNT(*)::numeric, 0) * 100, 
    2
  ) as conversion_rate
FROM public.contact_leads
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY period DESC;