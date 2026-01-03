// LinkedIn Posts Types for Content Approval System

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

export interface LinkedInPost {
  id: string;
  topic: string;
  target_audience: string | null;
  pain_point: string | null;
  desired_outcome: string | null;
  proof_points: string[] | null;
  cta_action: string | null;
  post_type: 'value' | 'commercial';
  carousel_data: CarouselData;
  caption: string | null;
  created_by: string | null;
  number_of_slides: number;
  status: 'pending_approval' | 'approved' | 'rejected' | 'published';
  approved_at: string | null;
  approved_by: string | null;
  published_at: string | null;
  rejection_reason: string | null;
  ai_generated: boolean;
  generation_mode: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkedInPostInsert {
  topic: string;
  target_audience?: string;
  pain_point?: string;
  desired_outcome?: string;
  proof_points?: string[];
  cta_action?: string;
  post_type?: 'value' | 'commercial';
  carousel_data: CarouselData;
  caption?: string;
  created_by?: string;
  number_of_slides?: number;
  status?: 'pending_approval' | 'approved' | 'rejected' | 'published';
  ai_generated?: boolean;
  generation_mode?: string;
}

export interface LinkedInPostUpdate extends Partial<LinkedInPostInsert> {
  id: string;
  approved_at?: string;
  approved_by?: string;
  published_at?: string;
  rejection_reason?: string;
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
