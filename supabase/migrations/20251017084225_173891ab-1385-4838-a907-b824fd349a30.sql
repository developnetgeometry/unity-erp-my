-- Add verified_at timestamp field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.verified_at IS 'Timestamp when the user email was verified';