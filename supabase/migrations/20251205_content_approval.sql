-- Create content_templates table for storing prompts and templates
CREATE TABLE public.content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- 'email_reply', 'linkedin_outreach', 'cold_email', 'carousel_content', 'crm_agent', 'personalized_outreach'
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt-BR', -- 'pt-BR' or 'en'
  niche TEXT, -- 'orthopedic', 'dental', 'veterinary', 'hospital', 'oem', 'general'
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'rejected', 'archived'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_approvals table for tracking approval workflow
CREATE TABLE public.content_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.content_templates(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  reviewer_type TEXT NOT NULL DEFAULT 'internal', -- 'internal' or 'client'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'changes_requested'
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_comments table for feedback
CREATE TABLE public.content_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.content_templates(id) ON DELETE CASCADE,
  approval_id UUID REFERENCES public.content_approvals(id) ON DELETE CASCADE,
  commenter_name TEXT NOT NULL,
  commenter_email TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_templates (allow public read for now, can be restricted later)
CREATE POLICY "Anyone can view templates"
ON public.content_templates
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert templates"
ON public.content_templates
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update templates"
ON public.content_templates
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete templates"
ON public.content_templates
FOR DELETE
USING (auth.role() = 'authenticated');

-- RLS policies for content_approvals
CREATE POLICY "Anyone can view approvals"
ON public.content_approvals
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert approvals"
ON public.content_approvals
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update approvals"
ON public.content_approvals
FOR UPDATE
USING (true);

-- RLS policies for content_comments
CREATE POLICY "Anyone can view comments"
ON public.content_comments
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert comments"
ON public.content_comments
FOR INSERT
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_content_templates_category ON public.content_templates(category);
CREATE INDEX idx_content_templates_status ON public.content_templates(status);
CREATE INDEX idx_content_templates_niche ON public.content_templates(niche);
CREATE INDEX idx_content_approvals_template_id ON public.content_approvals(template_id);
CREATE INDEX idx_content_approvals_status ON public.content_approvals(status);
CREATE INDEX idx_content_comments_template_id ON public.content_comments(template_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_content_templates_updated_at
BEFORE UPDATE ON public.content_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_content_updated_at();

CREATE TRIGGER update_content_approvals_updated_at
BEFORE UPDATE ON public.content_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_content_updated_at();
