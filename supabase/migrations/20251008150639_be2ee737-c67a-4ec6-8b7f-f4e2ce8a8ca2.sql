-- Step 1: First, let's check and fix any existing NULL salon_id values
-- We'll need to handle this data before making salon_id NOT NULL

-- Update customers with NULL salon_id (if any exist from test data)
-- This query will only update if there are NULL values
UPDATE public.customers 
SET salon_id = (SELECT id FROM salon_profiles LIMIT 1)
WHERE salon_id IS NULL 
AND EXISTS (SELECT 1 FROM salon_profiles LIMIT 1);

-- Do the same for other tables
UPDATE public.appointments 
SET salon_id = (SELECT id FROM salon_profiles LIMIT 1)
WHERE salon_id IS NULL 
AND EXISTS (SELECT 1 FROM salon_profiles LIMIT 1);

UPDATE public.products 
SET salon_id = (SELECT id FROM salon_profiles LIMIT 1)
WHERE salon_id IS NULL 
AND EXISTS (SELECT 1 FROM salon_profiles LIMIT 1);

UPDATE public.services 
SET salon_id = (SELECT id FROM salon_profiles LIMIT 1)
WHERE salon_id IS NULL 
AND EXISTS (SELECT 1 FROM salon_profiles LIMIT 1);

UPDATE public.sales 
SET salon_id = (SELECT id FROM salon_profiles LIMIT 1)
WHERE salon_id IS NULL 
AND EXISTS (SELECT 1 FROM salon_profiles LIMIT 1);

UPDATE public.staff 
SET salon_id = (SELECT id FROM salon_profiles LIMIT 1)
WHERE salon_id IS NULL 
AND EXISTS (SELECT 1 FROM salon_profiles LIMIT 1);

-- Step 2: Now make salon_id NOT NULL on critical tables
ALTER TABLE public.customers 
ALTER COLUMN salon_id SET NOT NULL;

ALTER TABLE public.appointments 
ALTER COLUMN salon_id SET NOT NULL;

ALTER TABLE public.products 
ALTER COLUMN salon_id SET NOT NULL;

ALTER TABLE public.services 
ALTER COLUMN salon_id SET NOT NULL;

ALTER TABLE public.sales 
ALTER COLUMN salon_id SET NOT NULL;

ALTER TABLE public.staff 
ALTER COLUMN salon_id SET NOT NULL;

-- Step 3: Create security function to check customer access
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
$$;

-- Step 4: Update customer RLS policy - restrict to admins/managers only
DROP POLICY IF EXISTS "Users can view their salon's customers" ON public.customers;

CREATE POLICY "Admins and managers can view customers"
ON public.customers
FOR SELECT
TO authenticated
USING (
  salon_id = get_user_salon_id(auth.uid())
  AND (
    has_role(auth.uid(), 'admin'::app_role, salon_id)
    OR has_role(auth.uid(), 'manager'::app_role, salon_id)
  )
);

-- Step 5: Restrict service_categories to authenticated users only
DROP POLICY IF EXISTS "Users can view service categories" ON public.service_categories;

CREATE POLICY "Authenticated users can view service categories"
ON public.service_categories
FOR SELECT
TO authenticated
USING (true);

-- Step 6: Add audit logging table for sensitive operations
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

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role, salon_id));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Step 7: Create audit trigger for customer changes
CREATE OR REPLACE FUNCTION public.audit_customer_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      salon_id,
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
    ) VALUES (
      NEW.salon_id,
      auth.uid(),
      'UPDATE',
      'customers',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (
      salon_id,
      user_id,
      action,
      table_name,
      record_id,
      old_data
    ) VALUES (
      OLD.salon_id,
      auth.uid(),
      'DELETE',
      'customers',
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach audit trigger to customers table
DROP TRIGGER IF EXISTS audit_customer_changes_trigger ON public.customers;
CREATE TRIGGER audit_customer_changes_trigger
AFTER UPDATE OR DELETE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.audit_customer_changes();