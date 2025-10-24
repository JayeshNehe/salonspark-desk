-- Fix remaining customer data access policies
-- Only admin and manager should be able to create and update customer records

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Users can create customers for their salon" ON public.customers;
DROP POLICY IF EXISTS "Users can update their salon's customers" ON public.customers;

-- Create restricted policies for INSERT and UPDATE
CREATE POLICY "Admins and managers can create customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (
  (salon_id = get_user_salon_id(auth.uid())) 
  AND 
  (has_role(auth.uid(), 'admin'::app_role, salon_id) OR has_role(auth.uid(), 'manager'::app_role, salon_id))
);

CREATE POLICY "Admins and managers can update customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (
  (salon_id = get_user_salon_id(auth.uid())) 
  AND 
  (has_role(auth.uid(), 'admin'::app_role, salon_id) OR has_role(auth.uid(), 'manager'::app_role, salon_id))
)
WITH CHECK (
  (salon_id = get_user_salon_id(auth.uid())) 
  AND 
  (has_role(auth.uid(), 'admin'::app_role, salon_id) OR has_role(auth.uid(), 'manager'::app_role, salon_id))
);