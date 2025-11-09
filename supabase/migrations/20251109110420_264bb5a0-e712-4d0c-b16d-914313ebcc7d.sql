-- Drop all policies that depend on has_role first
DROP POLICY IF EXISTS "Organizations and admins can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organizations and admins can update their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organizations and admins can create campaigns" ON public.outreach_campaigns;
DROP POLICY IF EXISTS "Organizations and admins can update campaigns" ON public.outreach_campaigns;
DROP POLICY IF EXISTS "Organizations and admins can delete campaigns" ON public.outreach_campaigns;
DROP POLICY IF EXISTS "Organizations and admins can add members" ON public.organization_members;
DROP POLICY IF EXISTS "Organizations and admins can remove members" ON public.organization_members;
DROP POLICY IF EXISTS "Organizations and admins can insert schools" ON public.schools;
DROP POLICY IF EXISTS "Organizations and admins can update schools" ON public.schools;
DROP POLICY IF EXISTS "Organizations and admins can delete schools" ON public.schools;
DROP POLICY IF EXISTS "Organizations and admins can manage recommendations" ON public.school_recommendations;

-- Drop functions
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_current_user_admin() CASCADE;

-- Update the enum
ALTER TYPE public.app_role RENAME TO app_role_old;
CREATE TYPE public.app_role AS ENUM ('organization', 'admin', 'school_official', 'learner');

-- Update user_roles table
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;

-- Drop old enum
DROP TYPE public.app_role_old;

-- Recreate has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Recreate is_current_user_admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role);
$$;

-- Recreate all the policies
CREATE POLICY "Organizations and admins can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role));

CREATE POLICY "Organizations and admins can update their organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  (id IN (SELECT get_user_organizations(auth.uid()))) 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
);

CREATE POLICY "Organizations and admins can create campaigns"
ON public.outreach_campaigns
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

CREATE POLICY "Organizations and admins can update campaigns"
ON public.outreach_campaigns
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

CREATE POLICY "Organizations and admins can delete campaigns"
ON public.outreach_campaigns
FOR DELETE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

CREATE POLICY "Organizations and admins can add members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  (organization_id IN (SELECT get_user_organizations(auth.uid())))
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
);

CREATE POLICY "Organizations and admins can remove members"
ON public.organization_members
FOR DELETE
TO authenticated
USING (
  (organization_id IN (SELECT get_user_organizations(auth.uid())))
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
);

CREATE POLICY "Organizations and admins can insert schools"
ON public.schools
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

CREATE POLICY "Organizations and admins can update schools"
ON public.schools
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

CREATE POLICY "Organizations and admins can delete schools"
ON public.schools
FOR DELETE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

CREATE POLICY "Organizations and admins can manage recommendations"
ON public.school_recommendations
FOR ALL
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (campaign_id IN (
    SELECT outreach_campaigns.id
    FROM outreach_campaigns
    WHERE outreach_campaigns.organization_id IN (SELECT get_user_organizations(auth.uid()))
  ))
);

-- Create outreach_requests table
CREATE TABLE IF NOT EXISTS public.outreach_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  school_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  outreach_type TEXT NOT NULL,
  workshop_topic TEXT,
  preferred_date DATE,
  alternative_date DATE,
  expected_participants INTEGER,
  grade_levels TEXT[],
  additional_notes TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending',
  organization_id UUID REFERENCES public.organizations(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  response_notes TEXT
);

ALTER TABLE public.outreach_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School officials can create requests"
ON public.outreach_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND has_role(auth.uid(), 'school_official'::app_role)
);

CREATE POLICY "School officials can view their own requests"
ON public.outreach_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "School officials can update their own pending requests"
ON public.outreach_requests
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status = 'pending'
);

CREATE POLICY "Organizations can view requests"
ON public.outreach_requests
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'organization'::app_role)
);

CREATE POLICY "Organizations can update requests"
ON public.outreach_requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'organization'::app_role)
);

CREATE TRIGGER update_outreach_requests_updated_at
  BEFORE UPDATE ON public.outreach_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();