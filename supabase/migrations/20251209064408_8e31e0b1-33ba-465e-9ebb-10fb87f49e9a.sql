-- Fix get_user_salon_id to work for both admin (salon owner) and receptionist (user with role)
CREATE OR REPLACE FUNCTION public.get_user_salon_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    -- First check if user is a salon owner
    (SELECT id FROM public.salon_profiles WHERE user_id = _user_id LIMIT 1),
    -- If not, check if they have a role assigned to a salon
    (SELECT salon_id FROM public.user_roles WHERE user_id = _user_id LIMIT 1)
  )
$$;