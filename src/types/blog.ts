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

export interface BlogAnalyticsEvent {
  id: string;
  post_id: string;
  session_id: string;
  user_email: string | null;
  company_domain: string | null;
  viewed_at: string;
  time_on_page: number;
  scroll_depth: number;
  cta_clicked: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

export interface NewsDigest {
  id: string;
  content: string;
  sources: string[] | null;
  customer_interests: string[] | null;
  search_query: string | null;
  generated_at: string;
  created_at: string;
}

export interface ContentPerformanceStats {
  post_id: string;
  post_title: string;
  post_slug: string;
  category_name: string;
  total_views: number;
  unique_sessions: number;
  avg_time_on_page: number;
  avg_scroll_depth: number;
  cta_click_rate: number;
  conversion_count: number;
  performance_score: number;
}
