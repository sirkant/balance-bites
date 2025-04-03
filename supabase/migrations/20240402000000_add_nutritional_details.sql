-- Add nutritional details columns to meals table
ALTER TABLE public.meals
ADD COLUMN calories INTEGER,
ADD COLUMN protein DECIMAL(10,2),
ADD COLUMN carbohydrates DECIMAL(10,2),
ADD COLUMN fats DECIMAL(10,2),
ADD COLUMN fiber DECIMAL(10,2),
ADD COLUMN sugar DECIMAL(10,2),
ADD COLUMN sodium DECIMAL(10,2),
ADD COLUMN cholesterol DECIMAL(10,2),
ADD COLUMN vitamins JSONB,
ADD COLUMN minerals JSONB;

-- Add recommended daily values for reference
CREATE TABLE public.nutritional_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  age_range VARCHAR(50),
  gender VARCHAR(20),
  activity_level VARCHAR(50),
  daily_calories INTEGER,
  daily_protein DECIMAL(10,2),
  daily_carbohydrates DECIMAL(10,2),
  daily_fats DECIMAL(10,2),
  daily_fiber DECIMAL(10,2),
  daily_sugar DECIMAL(10,2),
  daily_sodium DECIMAL(10,2),
  daily_cholesterol DECIMAL(10,2),
  created_at timestamptz DEFAULT now()
);

-- Insert some default recommendations
INSERT INTO public.nutritional_recommendations 
(age_range, gender, activity_level, daily_calories, daily_protein, daily_carbohydrates, daily_fats, daily_fiber, daily_sugar, daily_sodium, daily_cholesterol)
VALUES
('19-30', 'male', 'moderate', 2500, 56, 300, 83, 38, 50, 2300, 300),
('19-30', 'female', 'moderate', 2000, 46, 250, 67, 25, 50, 2300, 300),
('31-50', 'male', 'moderate', 2300, 56, 275, 77, 38, 50, 2300, 300),
('31-50', 'female', 'moderate', 1800, 46, 225, 60, 25, 50, 2300, 300);

-- Enable RLS on nutritional_recommendations
ALTER TABLE public.nutritional_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read recommendations
CREATE POLICY "Allow all authenticated users to read recommendations"
ON public.nutritional_recommendations
FOR SELECT
TO authenticated
USING (true); 