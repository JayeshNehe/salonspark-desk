-- Drop existing receptionist SELECT-only policy on products
DROP POLICY IF EXISTS "Receptionists can view products" ON public.products;

-- Create new policy giving receptionists full CRUD access to products
CREATE POLICY "Receptionists can manage products" 
ON public.products 
FOR ALL 
USING (has_role(auth.uid(), 'receptionist'::app_role) AND (salon_id = get_user_salon_id(auth.uid())))
WITH CHECK (has_role(auth.uid(), 'receptionist'::app_role) AND (salon_id = get_user_salon_id(auth.uid())));