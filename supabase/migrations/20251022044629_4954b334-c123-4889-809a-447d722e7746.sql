-- Make email column nullable in employees table to allow optional email addresses
-- This aligns with the UI where email is shown as optional
ALTER TABLE public.employees 
ALTER COLUMN email DROP NOT NULL;