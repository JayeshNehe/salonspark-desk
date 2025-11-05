-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Receptionists can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Receptionists can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Receptionists can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Receptionists can view services" ON public.services;
DROP POLICY IF EXISTS "Receptionists can view staff" ON public.staff;
DROP POLICY IF EXISTS "Receptionists can view products" ON public.products;

-- Receptionists can manage appointments
CREATE POLICY "Receptionists can manage appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'receptionist'::app_role) AND 
  salon_id = get_user_salon_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'receptionist'::app_role) AND 
  salon_id = get_user_salon_id(auth.uid())
);

-- Receptionists can manage customers
CREATE POLICY "Receptionists can manage customers"
ON public.customers
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'receptionist'::app_role) AND 
  salon_id = get_user_salon_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'receptionist'::app_role) AND 
  salon_id = get_user_salon_id(auth.uid())
);

-- Receptionists can manage sales/billing
CREATE POLICY "Receptionists can manage sales"
ON public.sales
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'receptionist'::app_role) AND 
  salon_id = get_user_salon_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'receptionist'::app_role) AND 
  salon_id = get_user_salon_id(auth.uid())
);

-- Receptionists can view services (read-only)
CREATE POLICY "Receptionists can view services"
ON public.services
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'receptionist'::app_role) AND 
  salon_id = get_user_salon_id(auth.uid())
);

-- Receptionists can view staff (read-only)
CREATE POLICY "Receptionists can view staff"
ON public.staff
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'receptionist'::app_role) AND 
  salon_id = get_user_salon_id(auth.uid())
);

-- Receptionists can view products (for billing)
CREATE POLICY "Receptionists can view products"
ON public.products
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'receptionist'::app_role) AND 
  salon_id = get_user_salon_id(auth.uid())
);