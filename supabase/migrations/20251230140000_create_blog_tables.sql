-- Blog System Tables for Lifetrek Medical
-- Creates tables for SEO-optimized blog with AI generation support
-- Part of commercial proposal: 24 posts over 6 months

-- =====================================================
-- 1. BLOG CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default categories based on content strategy
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Educacional', 'educacional', 'Artigos educacionais sobre fabricação de dispositivos médicos, processos, e certificações'),
  ('Produto', 'produto', 'Capacidades, equipamentos, e tecnologias da Lifetrek Medical'),
  ('Mercado', 'mercado', 'Tendências da indústria, regulamentações, e análises de mercado'),
  ('Prova Social', 'prova-social', 'Cases de clientes, depoimentos, e resultados')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 2. BLOG POSTS
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL, -- HTML content
  excerpt TEXT, -- Short summary for cards/previews
  featured_image TEXT, -- URL to image
  
  -- Metadata
  author_name TEXT DEFAULT 'Lifetrek Medical',
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- SEO Fields
  seo_title TEXT, -- Max 60 chars recommended
  seo_description TEXT, -- Max 160 chars recommended
  keywords TEXT[] DEFAULT '{}', -- Target keywords for SEO
  
  -- Publishing workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected')),
  published_at TIMESTAMPTZ,
  
  -- AI Generation tracking
  ai_generated BOOLEAN DEFAULT FALSE,
  news_sources TEXT[] DEFAULT '{}', -- URLs of news sources used
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- GIN index for array fields (tags, keywords)
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_keywords ON blog_posts USING GIN(keywords);

-- =====================================================
-- 4. AUTO-UPDATE TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

CREATE TRIGGER blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public: Read all categories
CREATE POLICY "Public can view all blog categories"
  ON blog_categories
  FOR SELECT
  TO public
  USING (true);

-- Public: Read only published posts
CREATE POLICY "Public can view published blog posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published');

-- Authenticated admins: Full access to categories
CREATE POLICY "Admins have full access to blog categories"
  ON blog_categories
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Authenticated admins: Full access to posts
CREATE POLICY "Admins have full access to blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- 6. SAMPLE DATA (For development/testing)
-- =====================================================

-- Insert a sample published post
INSERT INTO blog_posts (
  title, 
  slug, 
  content, 
  excerpt, 
  category_id,
  seo_title,
  seo_description,
  keywords,
  tags,
  status,
  published_at
) VALUES (
  'ISO 13485: Certificação Essencial para Fabricação de Dispositivos Médicos',
  'iso-13485-certificacao-dispositivos-medicos',
  '<h2>O que é a certificação ISO 13485?</h2><p>A ISO 13485 é a norma internacional que especifica requisitos para um sistema de gestão da qualidade aplicável ao desenvolvimento e fabricação de dispositivos médicos.</p><h2>Por que é importante?</h2><p>A certificação ISO 13485 demonstra o comprometimento com a qualidade e segurança dos produtos médicos, sendo um requisito essencial para acesso a mercados regulados.</p><h2>Lifetrek Medical e ISO 13485</h2><p>Com mais de 30 anos de experiência, a Lifetrek Medical mantém certificação ISO 13485 ativa, garantindo processos rigorosos de controle de qualidade em todas as etapas de fabricação.</p>',
  'Entenda a importância da certificação ISO 13485 na fabricação de dispositivos médicos e como ela garante qualidade e segurança.',
  (SELECT id FROM blog_categories WHERE slug = 'educacional'),
  'ISO 13485: Certificação para Dispositivos Médicos | Lifetrek',
  'Descubra o que é ISO 13485, por que é essencial para fabricantes de dispositivos médicos e como a Lifetrek Medical aplica esses padrões de qualidade.',
  ARRAY['iso 13485', 'certificação médica', 'dispositivos médicos', 'qualidade médica', 'anvisa'],
  ARRAY['ISO 13485', 'Certificação', 'Qualidade', 'Dispositivos Médicos'],
  'published',
  NOW() - INTERVAL '7 days'
) ON CONFLICT (slug) DO NOTHING;

-- Insert a draft post (for testing admin workflow)
INSERT INTO blog_posts (
  title, 
  slug, 
  content, 
  excerpt,
  category_id,
  status
) VALUES (
  'Guia Completo: Escolhendo o Fornecedor Ideal de Implantes Ortopédicos',
  'escolher-fornecedor-implantes-ortopedicos',
  '<h2>Critérios Essenciais</h2><p>Ao escolher um fornecedor de implantes ortopédicos, considere: certificações (ISO 13485, ANVISA), capacidade técnica, prazos de entrega, e suporte técnico.</p>',
  'Aprenda os critérios essenciais para selecionar um fornecedor confiável de implantes ortopédicos no Brasil.',
  (SELECT id FROM blog_categories WHERE slug = 'educacional'),
  'draft'
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 7. COMMENTS
-- =====================================================

COMMENT ON TABLE blog_categories IS 'Content categories for blog posts (Educational, Product, Market, Social Proof)';
COMMENT ON TABLE blog_posts IS 'Blog posts with full SEO optimization and AI generation tracking';
COMMENT ON COLUMN blog_posts.status IS 'Workflow: draft → pending_review → published | rejected';
COMMENT ON COLUMN blog_posts.ai_generated IS 'TRUE if content was generated by AI (Gemini/Perplexity)';
COMMENT ON COLUMN blog_posts.seo_title IS 'SEO-optimized title (max 60 chars recommended)';
COMMENT ON COLUMN blog_posts.seo_description IS 'Meta description for search engines (max 160 chars recommended)';
