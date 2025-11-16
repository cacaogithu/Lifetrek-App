-- Add lead scoring columns to contact_leads table
ALTER TABLE contact_leads 
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}'::jsonb;

-- Create index for faster sorting by score
CREATE INDEX IF NOT EXISTS idx_contact_leads_lead_score ON contact_leads(lead_score DESC);

-- Add comment for documentation
COMMENT ON COLUMN contact_leads.lead_score IS 'Automated lead quality score from 0-100 based on multiple factors';
COMMENT ON COLUMN contact_leads.score_breakdown IS 'Detailed breakdown of how the lead score was calculated for debugging';