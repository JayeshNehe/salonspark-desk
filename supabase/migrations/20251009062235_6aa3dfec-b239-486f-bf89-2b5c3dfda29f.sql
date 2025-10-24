-- Fix indirect customer data access through appointments and sales joins
-- Staff should only see appointments assigned to them, not all salon appointments

-- First, let's create a helper function to get staff record for current user
CREATE OR REPLACE FUNCTION public.get_user_staff_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.staff 
  WHERE salon_id = get_user_salon_id(_user_id)
  AND (email = (SELECT email FROM auth.users WHERE id = _user_id) 
       OR phone = (SELECT phone FROM public.profiles WHERE user_id = _user_id))
  LIMIT 1
$$;

-- Drop the overly permissive appointments view policy
DROP POLICY IF EXISTS "Users can view their salon's appointments" ON public.appointments;

-- Create role-based appointment view policies
-- Admin and managers can view all appointments
CREATE POLICY "Admins and managers can view all appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  (salon_id = get_user_salon_id(auth.uid())) 
  AND 
  (has_role(auth.uid(), 'admin'::app_role, salon_id) OR has_role(auth.uid(), 'manager'::app_role, salon_id))
);

-- Staff can only view their own appointments
CREATE POLICY "Staff can view their own appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  (salon_id = get_user_salon_id(auth.uid())) 
  AND 
  (staff_id = get_user_staff_id(auth.uid()))
);

-- Similarly fix sales access
DROP POLICY IF EXISTS "Users can view their salon's sales" ON public.sales;

-- Admin and managers can view all sales
CREATE POLICY "Admins and managers can view all sales"
ON public.sales
FOR SELECT
TO authenticated
USING (
  (salon_id = get_user_salon_id(auth.uid())) 
  AND 
  (has_role(auth.uid(), 'admin'::app_role, salon_id) OR has_role(auth.uid(), 'manager'::app_role, salon_id))
);

-- Staff can only view their own sales
CREATE POLICY "Staff can view their own sales"
ON public.sales
FOR SELECT
TO authenticated
USING (
  (salon_id = get_user_salon_id(auth.uid())) 
  AND 
  (staff_id = get_user_staff_id(auth.uid()))
);