-- Add minimum working hours and late clock-in adjustment fields to attendance_config
ALTER TABLE public.attendance_config 
ADD COLUMN IF NOT EXISTS minimum_working_hours numeric DEFAULT 9,
ADD COLUMN IF NOT EXISTS late_clockin_adjustment_enabled boolean DEFAULT true;