-- Fix: Restrict profiles SELECT policy to only allow users to view their own profile
-- This prevents any authenticated user from viewing all user profiles

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all data" ON public.profiles;

-- Create a restrictive policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);