
-- Harden profiles table: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Harden questionnaire_responses: ensure SELECT restricted to authenticated only (re-create for safety)
DROP POLICY IF EXISTS "Admins can view all responses" ON public.questionnaire_responses;

CREATE POLICY "Admins can view all responses"
ON public.questionnaire_responses FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role));
