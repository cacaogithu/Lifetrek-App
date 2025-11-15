-- Create table for caching company research data
CREATE TABLE company_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  company_name TEXT,
  website_summary TEXT,
  linkedin_info TEXT,
  industry TEXT,
  key_products TEXT[],
  recent_news TEXT,
  researched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for domain lookup
CREATE INDEX idx_company_research_domain ON company_research(domain);
CREATE INDEX idx_company_research_expires ON company_research(expires_at);

-- Create table for storing AI response suggestions
CREATE TABLE ai_response_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES contact_leads(id) ON DELETE CASCADE,
  subject_line TEXT NOT NULL,
  email_body TEXT NOT NULL,
  key_points TEXT[],
  follow_up_date DATE,
  priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high')),
  company_research_id UUID REFERENCES company_research(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_ai_suggestions_lead ON ai_response_suggestions(lead_id);
CREATE INDEX idx_ai_suggestions_created ON ai_response_suggestions(created_at DESC);

-- Enable RLS on both tables
ALTER TABLE company_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_response_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_research
CREATE POLICY "Admins can view company research" 
  ON company_research FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert company research" 
  ON company_research FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update company research" 
  ON company_research FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for ai_response_suggestions
CREATE POLICY "Admins can view AI suggestions" 
  ON ai_response_suggestions FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert AI suggestions" 
  ON ai_response_suggestions FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update AI suggestions" 
  ON ai_response_suggestions FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));