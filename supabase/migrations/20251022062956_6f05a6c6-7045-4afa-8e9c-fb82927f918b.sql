-- Fix security warning: Add search_path to calculate_ot_hours function

CREATE OR REPLACE FUNCTION public.calculate_ot_hours()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ot_out_time IS NOT NULL THEN
    NEW.total_ot_hours := EXTRACT(EPOCH FROM (NEW.ot_out_time - NEW.ot_in_time)) / 3600;
    NEW.status := 'completed';
  END IF;
  RETURN NEW;
END;
$$;