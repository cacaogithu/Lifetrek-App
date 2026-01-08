-- Create ENUM for profile type options
CREATE TYPE profile_type_enum AS ENUM ('company', 'salesperson');

-- Add profile_type column to linkedin_carousels table
ALTER TABLE linkedin_carousels
ADD COLUMN profile_type profile_type_enum DEFAULT 'company';

-- Comment on column
COMMENT ON COLUMN linkedin_carousels.profile_type IS 'Type of profile the content is generated for (company or salesperson)';
