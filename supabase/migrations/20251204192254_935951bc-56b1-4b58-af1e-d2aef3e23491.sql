-- Create function to update timestamps for daily_tasks
CREATE OR REPLACE FUNCTION public.update_daily_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create daily_tasks table
CREATE TABLE public.daily_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assigned_to UUID NOT NULL,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES public.contact_leads(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their assigned tasks"
ON public.daily_tasks
FOR SELECT
USING (auth.uid() = assigned_to OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert tasks"
ON public.daily_tasks
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own tasks"
ON public.daily_tasks
FOR UPDATE
USING (auth.uid() = assigned_to OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tasks"
ON public.daily_tasks
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_daily_tasks_updated_at
BEFORE UPDATE ON public.daily_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_daily_tasks_updated_at();

-- Create indexes
CREATE INDEX idx_daily_tasks_assigned_to ON public.daily_tasks(assigned_to);
CREATE INDEX idx_daily_tasks_status ON public.daily_tasks(status);
CREATE INDEX idx_daily_tasks_due_date ON public.daily_tasks(due_date);