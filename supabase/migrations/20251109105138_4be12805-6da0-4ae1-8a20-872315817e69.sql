-- Update the trigger function to handle custom organization details
CREATE OR REPLACE FUNCTION public.handle_new_user_with_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_org_id UUID;
  user_role app_role;
  org_name TEXT;
  org_description TEXT;
BEGIN
  -- Get role from user metadata, default to 'learner'
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'learner'::app_role
  );
  
  -- Assign the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- If user is an organization or admin, handle organization creation
  IF user_role IN ('organization', 'admin') THEN
    -- Get organization details from metadata
    org_name := NEW.raw_user_meta_data->>'organization_name';
    org_description := NEW.raw_user_meta_data->>'organization_description';
    
    -- If organization role with custom org details, create new organization
    IF user_role = 'organization' AND org_name IS NOT NULL THEN
      INSERT INTO public.organizations (name, description)
      VALUES (org_name, org_description)
      RETURNING id INTO new_org_id;
      
      -- Add the new user to their new organization
      INSERT INTO public.organization_members (organization_id, user_id)
      VALUES (new_org_id, NEW.id);
    ELSE
      -- For admins or organizations without custom details, use default org
      SELECT id INTO new_org_id
      FROM public.organizations
      WHERE name = 'STEM Outreach Organization'
      LIMIT 1;
      
      -- If no default organization exists, create one
      IF new_org_id IS NULL THEN
        INSERT INTO public.organizations (name)
        VALUES ('STEM Outreach Organization')
        RETURNING id INTO new_org_id;
      END IF;
      
      -- Add the new user to the default organization
      INSERT INTO public.organization_members (organization_id, user_id)
      VALUES (new_org_id, NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add description column to organizations table if it doesn't exist
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS description TEXT;