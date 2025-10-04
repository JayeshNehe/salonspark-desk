-- Assign admin role to all existing salon owners
INSERT INTO public.user_roles (user_id, salon_id, role)
SELECT user_id, id, 'admin'::app_role
FROM public.salon_profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = salon_profiles.user_id 
  AND user_roles.salon_id = salon_profiles.id
);