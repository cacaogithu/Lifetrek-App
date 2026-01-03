-- LinkedIn Posts System for Content Approval
-- Stores AI-generated LinkedIn carousel posts for approval workflow

-- =====================================================
-- 1. LINKEDIN POSTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS linkedin_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  topic TEXT NOT NULL,
  target_audience TEXT,
  pain_point TEXT,
  desired_outcome TEXT,
  proof_points TEXT[],
  cta_action TEXT,
  post_type TEXT DEFAULT 'value' CHECK (post_type IN ('value', 'commercial')),

  -- Generated Content (JSON structure)
  carousel_data JSONB NOT NULL, -- Full carousel object with slides
  caption TEXT, -- LinkedIn post caption

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  number_of_slides INTEGER DEFAULT 0,

  -- Publishing workflow
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'published')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- AI Generation tracking
  ai_generated BOOLEAN DEFAULT TRUE,
  generation_mode TEXT, -- 'generate', 'plan', etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_linkedin_posts_status ON linkedin_posts(status);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_created_at ON linkedin_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_created_by ON linkedin_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_post_type ON linkedin_posts(post_type);

-- =====================================================
-- 3. AUTO-UPDATE TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_linkedin_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER linkedin_posts_updated_at
  BEFORE UPDATE ON linkedin_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_linkedin_posts_updated_at();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE linkedin_posts ENABLE ROW LEVEL SECURITY;

-- Authenticated admins: Full access
CREATE POLICY "Admins have full access to linkedin posts"
  ON linkedin_posts
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Public: Can view only published posts (for potential future public gallery)
CREATE POLICY "Public can view published linkedin posts"
  ON linkedin_posts
  FOR SELECT
  TO public
  USING (status = 'published');

-- =====================================================
-- 5. COMMENTS
-- =====================================================

COMMENT ON TABLE linkedin_posts IS 'LinkedIn carousel posts with approval workflow';
COMMENT ON COLUMN linkedin_posts.status IS 'Workflow: pending_approval → approved/rejected → published';
COMMENT ON COLUMN linkedin_posts.carousel_data IS 'Full JSON carousel object with slides, images, etc.';
COMMENT ON COLUMN linkedin_posts.post_type IS 'value = educational, commercial = sales-focused';
