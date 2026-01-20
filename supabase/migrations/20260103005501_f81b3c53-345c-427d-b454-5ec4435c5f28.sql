-- Add status field to linkedin_carousels
ALTER TABLE linkedin_carousels 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Create generation logs table
CREATE TABLE IF NOT EXISTS linkedin_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  carousel_id UUID REFERENCES linkedin_carousels(id) ON DELETE SET NULL,
  input_params JSONB NOT NULL,
  strategist_output JSONB,
  analyst_output JSONB,
  final_output JSONB,
  generation_time_ms INTEGER,
  image_count INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE linkedin_generation_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for generation logs
CREATE POLICY "Admins can view generation logs"
ON linkedin_generation_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert generation logs"
ON linkedin_generation_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete generation logs"
ON linkedin_generation_logs FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));