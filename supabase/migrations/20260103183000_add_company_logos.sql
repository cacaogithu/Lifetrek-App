-- Add ISO 13485 and Lifetrek logos to company_assets
-- This migration ensures company branding assets are available for content generation

-- Insert ISO 13485:2016 certification logo
INSERT INTO company_assets (type, url, description)
VALUES (
  'iso_13485_logo',
  '/images/iso-13485-logo.jpg',
  'ISO 13485:2016 Medical Device Quality Management certification logo'
)
ON CONFLICT (type) DO UPDATE
SET url = EXCLUDED.url, description = EXCLUDED.description;

-- Insert Lifetrek Medical primary logo
INSERT INTO company_assets (type, url, description)
VALUES (
  'lifetrek_logo',
  '/images/lifetrek-logo.png',
  'Lifetrek Medical primary logo for brand consistency'
)
ON CONFLICT (type) DO UPDATE
SET url = EXCLUDED.url, description = EXCLUDED.description;
