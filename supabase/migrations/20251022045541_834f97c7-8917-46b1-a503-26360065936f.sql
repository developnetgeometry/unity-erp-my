-- Add positions column to departments table to store job titles/roles within the department
ALTER TABLE public.departments 
ADD COLUMN positions text[] DEFAULT '{}';