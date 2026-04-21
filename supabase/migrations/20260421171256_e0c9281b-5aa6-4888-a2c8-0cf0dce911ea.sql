
CREATE TABLE public.mentor_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  field_of_interest TEXT NOT NULL,
  grade_level TEXT,
  goals TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  matched_mentor_name TEXT,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners can view their own mentor requests"
  ON public.mentor_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Learners can create their own mentor requests"
  ON public.mentor_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Learners can update their own pending requests"
  ON public.mentor_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins and orgs can view all mentor requests"
  ON public.mentor_requests FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role));

CREATE POLICY "Admins and orgs can update mentor requests"
  ON public.mentor_requests FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role));

CREATE TRIGGER set_mentor_requests_updated_at
  BEFORE UPDATE ON public.mentor_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
