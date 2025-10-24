-- Fix customer PII exposure by restricting full access to admin/manager only
-- Drop the overly permissive policy that allows staff to view all customer data
DROP POLICY IF EXISTS "Restricted customer access" ON public.customers;

-- Create a strict policy: only admin and manager can view full customer data
CREATE POLICY "Admins and managers can view customers"
ON public.customers
FOR SELECT
TO authenticated
USING (
  (salon_id = get_user_salon_id(auth.uid())) 
  AND 
  (has_role(auth.uid(), 'admin'::app_role, salon_id) OR has_role(auth.uid(), 'manager'::app_role, salon_id))
);

-- Create a security definer function for staff to search customers with limited data
-- This prevents staff from accessing sensitive PII like addresses, emails, and birthdates
CREATE OR REPLACE FUNCTION public.search_customers_limited(
  search_term text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  phone text,
  salon_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.phone,
    c.salon_id
  FROM customers c
  WHERE c.salon_id = get_user_salon_id(auth.uid())
  AND (
    search_term IS NULL 
    OR c.first_name ILIKE '%' || search_term || '%'
    OR c.last_name ILIKE '%' || search_term || '%'
    OR c.phone ILIKE '%' || search_term || '%'
  )
  ORDER BY c.created_at DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.search_customers_limited(text) TO authenticated;