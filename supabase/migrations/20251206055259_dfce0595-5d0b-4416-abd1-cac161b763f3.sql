-- Update the handle_new_user_with_role function to reject privileged role self-assignment
-- and default all new signups to 'learner' role for security

CREATE OR REPLACE FUNCTION public.handle_new_user_with_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from user metadata, but ONLY allow non-privileged roles
  -- Admin and organization roles can only be assigned by existing admins
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'learner'::app_role
  );
  
  -- SECURITY: Reject privileged role self-assignment
  -- Only allow 'learner' and 'school_official' for self-registration
  IF user_role NOT IN ('learner', 'school_official') THEN
    user_role := 'learner'::app_role;
  END IF;
  
  -- Assign the validated role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- Note: Organization and admin accounts must be created by existing admins
  -- through a secure admin interface, not through self-registration
  
  RETURN NEW;
END;
$function$;