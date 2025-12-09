-- Create content_templates table
CREATE TABLE public.content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  niche TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_approvals table
CREATE TABLE public.content_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.content_templates(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  reviewer_type TEXT NOT NULL DEFAULT 'client',
  status TEXT NOT NULL,
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_comments table
CREATE TABLE public.content_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.content_templates(id) ON DELETE CASCADE,
  commenter_name TEXT NOT NULL,
  commenter_email TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_templates
CREATE POLICY "Public can view templates" ON public.content_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage templates" ON public.content_templates FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for content_approvals (anyone can submit approvals for review workflow)
CREATE POLICY "Public can view approvals" ON public.content_approvals FOR SELECT USING (true);
CREATE POLICY "Public can insert approvals" ON public.content_approvals FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage approvals" ON public.content_approvals FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for content_comments (anyone can comment for review workflow)
CREATE POLICY "Public can view comments" ON public.content_comments FOR SELECT USING (true);
CREATE POLICY "Public can insert comments" ON public.content_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage comments" ON public.content_comments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on content_templates
CREATE OR REPLACE FUNCTION public.update_content_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_content_templates_updated_at
BEFORE UPDATE ON public.content_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_content_templates_updated_at();

-- Create indexes
CREATE INDEX idx_content_templates_category ON public.content_templates(category);
CREATE INDEX idx_content_templates_status ON public.content_templates(status);
CREATE INDEX idx_content_approvals_template_id ON public.content_approvals(template_id);
CREATE INDEX idx_content_comments_template_id ON public.content_comments(template_id);