-- Auto-activate all pending users for development
UPDATE public.profiles
SET 
  status = 'active',
  email_verified = true,
  verified_at = now()
WHERE status = 'pending_verification' AND email_verified = false;