-- Add unique constraint for user_id + item_key to enable proper upsert
ALTER TABLE public.onboarding_progress
ADD CONSTRAINT onboarding_progress_user_item_unique UNIQUE (user_id, item_key);