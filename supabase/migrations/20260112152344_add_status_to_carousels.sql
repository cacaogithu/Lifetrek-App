
ALTER TABLE linkedin_carousels ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
ALTER TABLE linkedin_carousels ADD COLUMN IF NOT EXISTS scheduled_date timestamptz;
