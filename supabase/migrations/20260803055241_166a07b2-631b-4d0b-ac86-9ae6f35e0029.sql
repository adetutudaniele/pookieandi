-- Remove leftover privileges for signed-out visitors
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.player_stats FROM anon;
REVOKE ALL ON public.session_history FROM anon;

-- Player stats are maintained solely by the sync trigger
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.player_stats FROM authenticated;
GRANT SELECT ON public.player_stats TO authenticated;
GRANT ALL ON public.player_stats TO service_role;

-- Session history is append-only and owner scoped
REVOKE UPDATE, DELETE, TRUNCATE ON public.session_history FROM authenticated;
GRANT SELECT, INSERT ON public.session_history TO authenticated;
GRANT ALL ON public.session_history TO service_role;

-- Profiles: owner-scoped read/insert/update
REVOKE DELETE, TRUNCATE ON public.profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Ensure the profile update policy also validates the resulting row's ownership
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);