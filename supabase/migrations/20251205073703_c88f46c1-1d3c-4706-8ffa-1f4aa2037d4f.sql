-- Allow public school request submissions without authentication
-- Add a new policy for public inserts (user_id will be null for public submissions)

-- First, make user_id nullable for public submissions
ALTER TABLE public.outreach_requests ALTER COLUMN user_id DROP NOT NULL;

-- Add policy for public submissions (no auth required)
CREATE POLICY "Anyone can submit school requests" 
ON public.outreach_requests 
FOR INSERT 
WITH CHECK (true);

-- Update existing school official policy to be more specific
DROP POLICY IF EXISTS "School officials can create requests" ON public.outreach_requests;

CREATE POLICY "Authenticated school officials can create requests" 
ON public.outreach_requests 
FOR INSERT 
WITH CHECK (
  (user_id IS NOT NULL AND auth.uid() = user_id AND has_role(auth.uid(), 'school_official'::app_role))
  OR user_id IS NULL
);