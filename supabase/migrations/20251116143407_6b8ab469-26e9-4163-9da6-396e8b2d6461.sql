-- Create questionnaire types enum
CREATE TYPE public.questionnaire_type AS ENUM ('school_needs', 'company_offers');

-- Create questionnaire responses table
CREATE TABLE public.questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  questionnaire_type questionnaire_type NOT NULL,
  respondent_email TEXT NOT NULL,
  respondent_name TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  contact_phone TEXT,
  
  -- School-specific fields
  school_province TEXT,
  school_district TEXT,
  school_type TEXT,
  grade_levels TEXT[],
  student_count INTEGER,
  subjects_interested TEXT[],
  resources_needed TEXT,
  preferred_topics TEXT[],
  
  -- Company-specific fields
  company_type TEXT,
  services_offered TEXT[],
  topics_can_cover TEXT[],
  capacity_per_session INTEGER,
  geographic_coverage TEXT[],
  resources_available TEXT,
  
  -- Common fields
  additional_info TEXT,
  preferred_contact_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Public can insert responses
CREATE POLICY "Anyone can submit questionnaire responses"
ON public.questionnaire_responses
FOR INSERT
TO public
WITH CHECK (true);

-- Admins and organizations can view all responses
CREATE POLICY "Admins can view all responses"
ON public.questionnaire_responses
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role));

-- Admins can update responses
CREATE POLICY "Admins can update responses"
ON public.questionnaire_responses
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_questionnaire_responses_updated_at
BEFORE UPDATE ON public.questionnaire_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();