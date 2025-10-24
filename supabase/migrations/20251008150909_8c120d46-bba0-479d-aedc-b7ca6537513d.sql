-- Fix 1: Restrict customer data access to admins/managers and staff with appointments
CREATE OR REPLACE FUNCTION public.can_access_customer(_user_id uuid, _customer_id uuid, _salon_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id 
    AND salon_id = _salon_id
    AND role IN ('admin', 'manager')
  )
  OR EXISTS (
    SELECT 1 FROM appointments a
    JOIN staff s ON s.id = a.staff_id
    WHERE a.customer_id = _customer_id
    AND a.salon_id = _salon_id
    AND s.salon_id = _salon_id
  )
$$;

-- Drop existing customer policies
DROP POLICY IF EXISTS "Users can view their salon's customers" ON public.customers;
DROP POLICY IF EXISTS "Restricted customer access" ON public.customers;

-- Create new restrictive policy for customers
CREATE POLICY "Restricted customer access"
ON public.customers
FOR SELECT
TO authenticated
USING (
  salon_id IS NOT NULL 
  AND salon_id = get_user_salon_id(auth.uid())
  AND (
    has_role(auth.uid(), 'admin'::app_role, salon_id)
    OR has_role(auth.uid(), 'manager'::app_role, salon_id)
    OR EXISTS (
      SELECT 1 FROM appointments a
      JOIN staff s ON s.id = a.staff_id
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE a.customer_id = customers.id
      AND a.salon_id = customers.salon_id
      AND (s.email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR s.phone = p.phone)
    )
  )
);

-- Fix 2: Restrict service_categories access
DROP POLICY IF EXISTS "Users can view service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Authenticated users can view service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Salon users can view service categories" ON public.service_categories;

CREATE POLICY "Salon users can view service categories"
ON public.service_categories
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM salon_profiles WHERE user_id = auth.uid())
);

-- Fix 3: Make salon_id NOT NULL on critical tables
ALTER TABLE public.customers ALTER COLUMN salon_id SET NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN salon_id SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN salon_id SET NOT NULL;
ALTER TABLE public.services ALTER COLUMN salon_id SET NOT NULL;
ALTER TABLE public.sales ALTER COLUMN salon_id SET NOT NULL;
ALTER TABLE public.staff ALTER COLUMN salon_id SET NOT NULL;

-- Fix 4: Create audit logging infrastructure
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing audit log policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create audit log policies
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role, salon_id));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_customer_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (salon_id, user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.salon_id, auth.uid(), 'UPDATE', 'customers', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (salon_id, user_id, action, table_name, record_id, old_data)
    VALUES (OLD.salon_id, auth.uid(), 'DELETE', 'customers', OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_customer_changes_trigger ON public.customers;
CREATE TRIGGER audit_customer_changes_trigger
AFTER UPDATE OR DELETE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.audit_customer_changes();