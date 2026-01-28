-- Add generation metadata columns to linkedin_carousels table
alter table public.linkedin_carousels 
add column if not exists generation_method text, -- 'auto-generate', 'auto-ai-browse', 'manual', etc.
add column if not exists generation_settings jsonb; -- Store the full strategy/prompt used for generation
