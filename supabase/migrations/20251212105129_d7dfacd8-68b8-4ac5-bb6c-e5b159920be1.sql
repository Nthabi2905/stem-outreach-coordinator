-- Create organization activity log table
CREATE TABLE public.organization_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  organization_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  performed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins and organization members can view logs for their organizations
CREATE POLICY "Admins can view all activity logs"
ON public.organization_activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role));

-- Only admins and organization users can insert logs
CREATE POLICY "Admins can insert activity logs"
ON public.organization_activity_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role));

-- Create index for faster queries
CREATE INDEX idx_org_activity_logs_org_id ON public.organization_activity_logs(organization_id);
CREATE INDEX idx_org_activity_logs_created_at ON public.organization_activity_logs(created_at DESC);