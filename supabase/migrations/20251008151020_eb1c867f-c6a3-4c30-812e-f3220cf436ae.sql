-- Clean up duplicate policies on customers table
DROP POLICY IF EXISTS "Admins and managers can view customers" ON public.customers;

-- Ensure the helper function exists
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
  OR
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN staff s ON s.id = a.staff_id
    WHERE a.customer_id = _customer_id
    AND a.salon_id = _salon_id
    AND s.salon_id = _salon_id
  )
$$;

-- Make salon_id NOT NULL on critical tables (if not already)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND column_name = 'salon_id' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.customers ALTER COLUMN salon_id SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'salon_id' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.appointments ALTER COLUMN salon_id SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'salon_id' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.products ALTER COLUMN salon_id SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' 
    AND column_name = 'salon_id' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.services ALTER COLUMN salon_id SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' 
    AND column_name = 'salon_id' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.sales ALTER COLUMN salon_id SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' 
    AND column_name = 'salon_id' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.staff ALTER COLUMN salon_id SET NOT NULL;
  END IF;
END $$;

-- Create audit logging table if it doesn't exist
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

-- Enable RLS on audit_logs if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'audit_logs' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role, salon_id));

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
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

-- Attach audit trigger
DROP TRIGGER IF EXISTS audit_customer_changes_trigger ON public.customers;
CREATE TRIGGER audit_customer_changes_trigger
AFTER UPDATE OR DELETE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.audit_customer_changes();