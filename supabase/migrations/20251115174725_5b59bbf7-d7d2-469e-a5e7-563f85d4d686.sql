-- Create ENUM for project type options
CREATE TYPE project_type_option AS ENUM (
  'dental_implants',
  'orthopedic_implants', 
  'spinal_implants',
  'veterinary_implants',
  'surgical_instruments',
  'micro_precision_parts',
  'custom_tooling',
  'medical_devices',
  'measurement_tools',
  'other_medical'
);

-- Add new column for array of project types
ALTER TABLE contact_leads 
ADD COLUMN project_types project_type_option[] DEFAULT ARRAY[]::project_type_option[];

-- Migrate existing data from project_type to project_types
UPDATE contact_leads 
SET project_types = ARRAY['other_medical']::project_type_option[]
WHERE project_type IS NOT NULL AND project_type != '';

-- Create index for better query performance on array column
CREATE INDEX idx_contact_leads_project_types ON contact_leads USING GIN (project_types);

-- Create view for detailed lead analytics
CREATE OR REPLACE VIEW lead_analytics_detailed AS
SELECT 
  l.id,
  l.name,
  l.email,
  l.company,
  l.phone,
  l.project_types,
  l.annual_volume,
  l.status,
  l.priority,
  l.created_at,
  l.updated_at,
  DATE(l.created_at) as lead_date,
  CASE 
    WHEN l.created_at >= NOW() - INTERVAL '24 hours' THEN 'today'
    WHEN l.created_at >= NOW() - INTERVAL '7 days' THEN 'this_week'
    WHEN l.created_at >= NOW() - INTERVAL '30 days' THEN 'this_month'
    ELSE 'older'
  END as time_bucket,
  CASE 
    WHEN l.status IN ('closed') THEN true
    ELSE false
  END as is_converted
FROM contact_leads l;

-- Create view for project type distribution
CREATE OR REPLACE VIEW project_type_distribution AS
SELECT 
  pt as project_type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE status = 'closed') as converted_count,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'closed')::numeric / 
     NULLIF(COUNT(*), 0) * 100), 
    1
  ) as conversion_rate
FROM contact_leads
CROSS JOIN UNNEST(project_types) as pt
GROUP BY pt
ORDER BY count DESC;

-- Create view for lead metrics by time period
CREATE OR REPLACE VIEW lead_metrics_by_period AS
SELECT 
  DATE_TRUNC('day', created_at) as period,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'new') as new_leads,
  COUNT(*) FILTER (WHERE status IN ('contacted', 'in_progress', 'quoted')) as active_leads,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_leads,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_leads,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'closed')::numeric / 
     NULLIF(COUNT(*), 0) * 100), 
    1
  ) as conversion_rate
FROM contact_leads
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY period DESC;

-- Grant permissions for views
GRANT SELECT ON lead_analytics_detailed TO authenticated;
GRANT SELECT ON project_type_distribution TO authenticated;
GRANT SELECT ON lead_metrics_by_period TO authenticated;