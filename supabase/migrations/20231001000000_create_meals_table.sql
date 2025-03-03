
-- Create meals table
CREATE TABLE public.meals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  analysis jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to link meals to users
ALTER TABLE public.meals
  ADD CONSTRAINT fk_user
  FOREIGN KEY (user_id) REFERENCES auth.users (id);

-- Set up RLS (Row Level Security) to ensure users can only access their own meals
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting meals (users can only see their own)
CREATE POLICY "Users can view their own meals" 
  ON public.meals 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for inserting meals (users can only add their own)
CREATE POLICY "Users can insert their own meals" 
  ON public.meals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
