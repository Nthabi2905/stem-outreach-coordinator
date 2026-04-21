
ALTER TABLE public.mentor_requests
  ADD COLUMN matched_mentor_email TEXT,
  ADD COLUMN matched_mentor_role TEXT,
  ADD COLUMN matched_mentor_organization TEXT,
  ADD COLUMN matched_mentor_bio TEXT,
  ADD COLUMN matched_mentor_linkedin TEXT,
  ADD COLUMN contact_instructions TEXT;
