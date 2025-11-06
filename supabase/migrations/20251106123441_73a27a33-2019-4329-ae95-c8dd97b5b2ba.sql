-- Create a secure function to handle complete salon registration
-- This runs with SECURITY DEFINER to bypass RLS during registration
CREATE OR REPLACE FUNCTION public.complete_salon_registration(
  p_user_id uuid,
  p_salon_name text,
  p_phone text,
  p_address text,
  p_city text DEFAULT 'City',
  p_state text DEFAULT 'State',
  p_zip_code text DEFAULT '000000',
  p_country text DEFAULT 'India'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_salon_id uuid;
  v_result jsonb;
BEGIN
  -- Check if user already has a salon
  SELECT id INTO v_salon_id
  FROM public.salon_profiles
  WHERE user_id = p_user_id;

  IF v_salon_id IS NOT NULL THEN
    RAISE EXCEPTION 'User already has a salon profile';
  END IF;

  -- Create salon profile
  INSERT INTO public.salon_profiles (
    user_id,
    salon_name,
    phone,
    address,
    city,
    state,
    zip_code,
    country
  )
  VALUES (
    p_user_id,
    p_salon_name,
    p_phone,
    p_address,
    p_city,
    p_state,
    p_zip_code,
    p_country
  )
  RETURNING id INTO v_salon_id;

  -- Assign admin role
  INSERT INTO public.user_roles (
    user_id,
    salon_id,
    role
  )
  VALUES (
    p_user_id,
    v_salon_id,
    'admin'::app_role
  );

  -- Create salon settings
  INSERT INTO public.salon_settings (salon_id)
  VALUES (v_salon_id);

  -- Return success with salon_id
  v_result := jsonb_build_object(
    'success', true,
    'salon_id', v_salon_id
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;