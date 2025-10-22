-- Phase 1: Extend attendance_config table with default clock times
ALTER TABLE attendance_config 
ADD COLUMN IF NOT EXISTS default_clock_in_time TIME,
ADD COLUMN IF NOT EXISTS default_clock_out_time TIME;

-- Phase 2: Create employee_sites junction table for site assignments
CREATE TABLE IF NOT EXISTS employee_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES work_sites(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, site_id)
);

-- Enable RLS on employee_sites
ALTER TABLE employee_sites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage employee sites
CREATE POLICY "Admins can manage employee sites"
ON employee_sites FOR ALL
USING (
  employee_id IN (
    SELECT id FROM employees 
    WHERE company_id = get_user_company_id(auth.uid())
  ) 
  AND has_role(auth.uid(), 'company_admin')
);

-- RLS Policy: Employees can view their assigned sites
CREATE POLICY "Employees can view their assigned sites"
ON employee_sites FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

-- Phase 3: Create helper function to check site access
CREATE OR REPLACE FUNCTION can_clock_at_site(
  p_employee_id UUID,
  p_site_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employee_sites
    WHERE employee_id = p_employee_id
      AND site_id = p_site_id
  );
END;
$$;

-- Add trigger to update updated_at on employee_sites
CREATE TRIGGER update_employee_sites_updated_at
BEFORE UPDATE ON employee_sites
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();