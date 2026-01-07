-- Create leads table for lead management system
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Company Information
  nome_empresa TEXT NOT NULL,
  website TEXT,
  telefone TEXT,
  segmento TEXT,
  categoria TEXT,
  
  -- Enrichment Data (stored as JSONB for flexibility)
  scraped_emails JSONB DEFAULT '[]'::jsonb,
  linkedin_profiles JSONB DEFAULT '[]'::jsonb,
  decision_makers JSONB DEFAULT '[]'::jsonb,
  
  -- Company Indicators
  has_fda BOOLEAN DEFAULT false,
  has_ce BOOLEAN DEFAULT false,
  has_iso BOOLEAN DEFAULT false,
  has_rd BOOLEAN DEFAULT false,
  years_in_business INTEGER DEFAULT 0,
  countries_served INTEGER DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  
  -- Scoring
  predicted_score DECIMAL(4,2) DEFAULT 0,
  v2_score DECIMAL(4,2) DEFAULT 0,
  
  -- Status
  enrichment_status TEXT DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'in_progress', 'complete', 'failed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Metadata
  last_enriched_at TIMESTAMPTZ,
  source TEXT,
  notes TEXT,
  
  -- Unique constraint on company name
  CONSTRAINT unique_company_name UNIQUE(nome_empresa)
);

-- Indexes for performance
CREATE INDEX idx_leads_nome_empresa ON leads(nome_empresa);
CREATE INDEX idx_leads_v2_score ON leads(v2_score DESC);
CREATE INDEX idx_leads_enrichment_status ON leads(enrichment_status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_website ON leads(website);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at_trigger
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_leads_updated_at();

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users (admins) full access
CREATE POLICY "Admin full access to leads"
ON leads
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow service role (for Edge Functions and scripts) full access
CREATE POLICY "Service role full access to leads"
ON leads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a view for easy CSV export with flattened data
CREATE OR REPLACE VIEW leads_export AS
SELECT 
  nome_empresa as "Nome Empresa",
  website as "Website",
  telefone as "Telefone",
  segmento as "Segmento",
  categoria as "Categoria",
  scraped_emails::text as "Scraped_Emails",
  linkedin_profiles::text as "LinkedIn_Profiles",
  decision_makers::text as "Decision_Makers",
  has_fda as "has_fda",
  has_ce as "has_ce",
  has_iso as "has_iso",
  has_rd as "has_rd",
  years_in_business as "years",
  countries_served as "countries",
  employee_count as "employees",
  predicted_score as "Predicted_Score",
  v2_score as "V2_Score",
  enrichment_status as "Enrichment_Status",
  priority as "Priority",
  last_enriched_at as "Last_Enriched_At",
  source as "Source",
  notes as "Notes"
FROM leads
ORDER BY v2_score DESC;
