DROP POLICY IF EXISTS "Public read player stats" ON public.player_stats;
CREATE POLICY "Authenticated can read player stats"
ON public.player_stats FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.player_stats FROM anon;

DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
REVOKE SELECT ON public.profiles FROM anon;