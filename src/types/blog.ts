export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_name: string;
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[] | null;
  category_id: string | null;
  category?: BlogCategory;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  ai_generated: boolean;
  news_sources: string[] | null;
}

export interface BlogPostInsert {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_name?: string;
  status?: 'draft' | 'pending_review' | 'published' | 'rejected';
  seo_title?: string;
  seo_description?: string;
  keywords?: string[];
  category_id?: string;
  tags?: string[];
  published_at?: string;
  ai_generated?: boolean;
  news_sources?: string[];
}

export interface BlogPostUpdate extends Partial<BlogPostInsert> {
  id: string;
}
