-- Create RPC function to centralize admin status checks
-- This improves security by hiding database structure from client
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT has_role(auth.uid(), 'admin'::app_role);
$$;