-- Create outreach campaigns table
CREATE TABLE public.outreach_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  school_type TEXT NOT NULL CHECK (school_type IN ('primary', 'high', 'combined')),
  visit_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'review', 'letters_sent', 'confirmed', 'completed')),
  visit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create school recommendations table
CREATE TABLE public.school_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.outreach_campaigns(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  generated_data JSONB NOT NULL,
  enrollment_total INTEGER,
  language_of_instruction TEXT,
  is_accepted BOOLEAN DEFAULT NULL,
  is_replacement BOOLEAN DEFAULT false,
  letter_sent_at TIMESTAMP WITH TIME ZONE,
  school_response TEXT CHECK (school_response IN ('pending', 'accepted', 'declined')),
  school_response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for outreach_campaigns
CREATE POLICY "Users can view campaigns from their organizations"
  ON public.outreach_campaigns FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Admins can create campaigns for their organizations"
  ON public.outreach_campaigns FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) 
    AND organization_id IN (SELECT get_user_organizations(auth.uid()))
  );

CREATE POLICY "Admins can update campaigns in their organizations"
  ON public.outreach_campaigns FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    AND organization_id IN (SELECT get_user_organizations(auth.uid()))
  );

CREATE POLICY "Admins can delete campaigns from their organizations"
  ON public.outreach_campaigns FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    AND organization_id IN (SELECT get_user_organizations(auth.uid()))
  );

-- RLS policies for school_recommendations
CREATE POLICY "Users can view recommendations from their organization campaigns"
  ON public.school_recommendations FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.outreach_campaigns 
      WHERE organization_id IN (SELECT get_user_organizations(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage recommendations"
  ON public.school_recommendations FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    AND campaign_id IN (
      SELECT id FROM public.outreach_campaigns 
      WHERE organization_id IN (SELECT get_user_organizations(auth.uid()))
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_outreach_campaigns_updated_at
  BEFORE UPDATE ON public.outreach_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();