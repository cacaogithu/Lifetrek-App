// LinkedIn Carousel Types - aligned with linkedin_carousels table

export interface CarouselSlide {
  type: string; // 'hook', 'content', 'cta'
  headline: string;
  body: string;
  imageGenerationPrompt?: string;
  backgroundType: string; // 'generate', 'asset', 'gradient'
  assetId?: string;
  imageUrl?: string;
  image_style?: string;
  designer_notes?: string;
  brand_association?: string;
  copywriter_notes?: string;
  textPlacement?: string;
}

export interface CarouselData {
  topic: string;
  targetAudience: string;
  slides: CarouselSlide[];
  imageUrls?: string[];
  caption?: string;
  strategy_brief?: any;
}

// This interface is kept for backward compatibility but 
// the hook now uses Tables<"linkedin_carousels"> from Supabase types
export interface LinkedInPost {
  id: string;
  admin_user_id: string;
  topic: string;
  target_audience: string;
  pain_point: string | null;
  desired_outcome: string | null;
  proof_points: string | null;
  cta_action: string | null;
  slides: CarouselSlide[];
  caption: string;
  format: string | null;
  image_urls: string[];
  generation_settings: Record<string, any> | null;
  performance_metrics: Record<string, any> | null;
  is_favorite: boolean | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentApprovalItem {
  id: string;
  type: 'blog' | 'linkedin';
  title: string;
  content_preview: string;
  status: string;
  created_at: string;
  ai_generated: boolean;
  full_data: any;
}
