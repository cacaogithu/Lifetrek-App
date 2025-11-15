-- Add image generation support to linkedin_carousels table
ALTER TABLE linkedin_carousels 
ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'carousel' CHECK (format IN ('carousel', 'single-image')),
ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS generation_settings JSONB DEFAULT '{}'::jsonb;

-- Add index for format filtering
CREATE INDEX IF NOT EXISTS idx_linkedin_carousels_format ON linkedin_carousels(format);

-- Add index for created_at for sorting history
CREATE INDEX IF NOT EXISTS idx_linkedin_carousels_created_at ON linkedin_carousels(created_at DESC);