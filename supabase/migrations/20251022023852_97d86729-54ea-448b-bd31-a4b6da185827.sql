-- Add user_id to employees table to link employees with auth users
ALTER TABLE public.employees 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_employees_user_id ON public.employees(user_id);

-- Create unique constraint to ensure one employee per user
CREATE UNIQUE INDEX idx_employees_unique_user ON public.employees(user_id) WHERE user_id IS NOT NULL;