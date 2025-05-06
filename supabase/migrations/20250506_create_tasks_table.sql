
-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  website_id UUID REFERENCES public.websites NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
CREATE POLICY "Users can view tasks for websites they own" ON public.tasks
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_id AND websites.user_id = auth.uid()
  ));
  
CREATE POLICY "Users can insert tasks for websites they own" ON public.tasks
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_id AND websites.user_id = auth.uid()
  ));
  
CREATE POLICY "Users can update tasks for websites they own" ON public.tasks
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_id AND websites.user_id = auth.uid()
  ));
  
CREATE POLICY "Users can delete tasks for websites they own" ON public.tasks
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.websites 
    WHERE websites.id = website_id AND websites.user_id = auth.uid()
  ));
