-- Add email verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_token uuid,
ADD COLUMN IF NOT EXISTS verification_token_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_verification';

-- Update existing profiles to active status if they don't have verification fields set
UPDATE public.profiles 
SET status = 'active', email_verified = true 
WHERE status IS NULL OR status = 'pending_verification';

-- Add missing fields to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS registration_no text,
ADD COLUMN IF NOT EXISTS business_type text;

-- Create trigger function to update status when email is verified
CREATE OR REPLACE FUNCTION public.update_profile_status_on_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_verified = true AND (OLD.email_verified = false OR OLD.email_verified IS NULL) THEN
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic status updates
DROP TRIGGER IF EXISTS on_profile_email_verified ON public.profiles;
CREATE TRIGGER on_profile_email_verified
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_status_on_verification();

-- Update handle_new_user function to set initial verification status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, company_id, full_name, email, status, email_verified)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    'pending_verification',
    false
  );
  RETURN NEW;
END;
$$;