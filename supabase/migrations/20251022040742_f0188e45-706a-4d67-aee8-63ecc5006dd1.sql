-- Fix the mini@yopmail.com profile to allow immediate sign-in
UPDATE profiles 
SET 
  status = 'active',
  email_verified = true
WHERE email = 'mini@yopmail.com';