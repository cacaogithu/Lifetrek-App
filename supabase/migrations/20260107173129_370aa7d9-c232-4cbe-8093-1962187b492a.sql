-- Add index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_linkedin_carousels_status 
ON linkedin_carousels(status);

-- Add index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_linkedin_carousels_created_at 
ON linkedin_carousels(created_at DESC);