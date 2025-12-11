-- Add email column to user_roles table to store user emails for display
ALTER TABLE public.user_roles ADD COLUMN email text;

-- Update existing rows to have empty email (will be populated on new creations)
UPDATE public.user_roles SET email = '' WHERE email IS NULL;