-- Update all existing users with pending_verification status to active
UPDATE public.profiles
SET 
  status = 'active',
  email_verified = true
WHERE status = 'pending_verification';