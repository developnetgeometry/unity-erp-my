-- Create departments table first
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments
CREATE POLICY "Users can view departments in their company"
  ON public.departments FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company admins can insert departments"
  ON public.departments FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id(auth.uid()) 
    AND (has_role(auth.uid(), 'company_admin') OR has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Company admins can update departments"
  ON public.departments FOR UPDATE
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'company_admin') OR has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Company admins can delete departments"
  ON public.departments FOR DELETE
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'company_admin') OR has_role(auth.uid(), 'super_admin'))
  );

-- Create employees table if not exists (now that departments exists)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  join_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, employee_number),
  UNIQUE(company_id, email)
);

-- Enable RLS on employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Users can view employees in their company"
  ON public.employees FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company admins can insert employees"
  ON public.employees FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'company_admin') OR has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Company admins can update employees"
  ON public.employees FOR UPDATE
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'company_admin') OR has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Company admins can delete employees"
  ON public.employees FOR DELETE
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'company_admin') OR has_role(auth.uid(), 'super_admin'))
  );

-- Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update department employee count
CREATE OR REPLACE FUNCTION public.update_department_employee_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update old department if exists
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.department_id IS NOT NULL) THEN
    UPDATE public.departments
    SET employee_count = (
      SELECT COUNT(*) FROM public.employees 
      WHERE department_id = OLD.department_id
    )
    WHERE id = OLD.department_id;
  END IF;
  
  -- Update new department if exists
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.department_id IS NOT NULL) THEN
    UPDATE public.departments
    SET employee_count = (
      SELECT COUNT(*) FROM public.employees 
      WHERE department_id = NEW.department_id
    )
    WHERE id = NEW.department_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for employee count updates
CREATE TRIGGER update_department_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_department_employee_count();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON public.departments(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON public.employees(branch_id);

-- Insert sample departments
INSERT INTO public.departments (company_id, name, description, employee_count)
SELECT 
  c.id,
  dept.name,
  dept.description,
  0
FROM public.companies c
CROSS JOIN (
  VALUES 
    ('Information Technology', 'Technology and software development team'),
    ('Human Resources', 'Employee management and recruitment'),
    ('Finance & Accounting', 'Financial operations and accounting'),
    ('Operations', 'Day-to-day business operations'),
    ('Sales & Marketing', 'Sales and marketing activities')
) AS dept(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.departments d 
  WHERE d.company_id = c.id AND d.name = dept.name
);

-- Insert sample employees
INSERT INTO public.employees (company_id, employee_number, full_name, email, phone, position, department_id, join_date, status)
SELECT 
  c.id,
  'EMP' || LPAD((ROW_NUMBER() OVER (PARTITION BY c.id))::TEXT, 4, '0'),
  emp.full_name,
  emp.email,
  emp.phone,
  emp.position,
  d.id,
  emp.join_date::DATE,
  'active'
FROM public.companies c
CROSS JOIN (
  VALUES 
    ('Ahmad Hassan', 'ahmad.hassan@company.com', '+60123456789', 'IT Manager', 'Information Technology', '2023-01-15'),
    ('Siti Nurhaliza', 'siti.nurhaliza@company.com', '+60123456790', 'HR Manager', 'Human Resources', '2022-06-01'),
    ('Lee Wei Ming', 'lee.weiming@company.com', '+60123456791', 'Finance Manager', 'Finance & Accounting', '2021-09-10'),
    ('Raj Kumar', 'raj.kumar@company.com', '+60123456792', 'Operations Manager', 'Operations', '2023-03-20'),
    ('Nurul Ain', 'nurul.ain@company.com', '+60123456793', 'Sales Manager', 'Sales & Marketing', '2022-11-05')
) AS emp(full_name, email, phone, position, department, join_date)
LEFT JOIN public.departments d ON d.company_id = c.id AND d.name = emp.department
WHERE NOT EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.company_id = c.id AND e.email = emp.email
);