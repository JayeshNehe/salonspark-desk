-- Fix function security by setting proper search_path for update_updated_at_column
-- Use CREATE OR REPLACE to avoid dropping dependent triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;