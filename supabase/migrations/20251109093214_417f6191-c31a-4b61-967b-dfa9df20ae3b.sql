-- Add response tracking fields to school_recommendations
ALTER TABLE public.school_recommendations
ADD COLUMN IF NOT EXISTS response_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS response_token text,
ADD COLUMN IF NOT EXISTS responded_at timestamp with time zone;

-- Add event date to outreach_campaigns
ALTER TABLE public.outreach_campaigns
ADD COLUMN IF NOT EXISTS event_date timestamp with time zone;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_school_recommendations_response_token 
ON public.school_recommendations(response_token);

-- Add check constraint for valid response statuses
ALTER TABLE public.school_recommendations
DROP CONSTRAINT IF EXISTS valid_response_status;

ALTER TABLE public.school_recommendations
ADD CONSTRAINT valid_response_status 
CHECK (response_status IN ('pending', 'confirmed', 'declined', 'no_response'));

-- Create RLS policy for public response page (token-based access)
CREATE POLICY "Public can view with valid token"
ON public.school_recommendations
FOR SELECT
USING (response_token IS NOT NULL);

CREATE POLICY "Public can update with valid token"
ON public.school_recommendations
FOR UPDATE
USING (response_token IS NOT NULL)
WITH CHECK (response_token IS NOT NULL);