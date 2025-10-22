-- Update handle_new_user() trigger to auto-activate users with confirmed emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Determine status and email_verified based on email confirmation
  INSERT INTO public.profiles (
    id, 
    company_id, 
    full_name, 
    email, 
    status, 
    email_verified
  )
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    -- Set active if email was confirmed during registration
    CASE 
      WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'
      ELSE 'pending_verification'
    END,
    -- Set email_verified if email was confirmed
    CASE 
      WHEN NEW.email_confirmed_at IS NOT NULL THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$function$;