
-- Tighten rooms table policies (drop overly-permissive ones, restrict to non-expired rooms, block deletes)
DROP POLICY IF EXISTS "Anyone can read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can delete rooms" ON public.rooms;

CREATE POLICY "Read active rooms" ON public.rooms
  FOR SELECT TO anon, authenticated
  USING (expires_at > now());

CREATE POLICY "Create active rooms" ON public.rooms
  FOR INSERT TO anon, authenticated
  WITH CHECK (expires_at > now() AND expires_at <= now() + interval '48 hours');

CREATE POLICY "Update active rooms" ON public.rooms
  FOR UPDATE TO anon, authenticated
  USING (expires_at > now())
  WITH CHECK (expires_at > now());

-- No DELETE policy: destructive removal is disallowed for public/anon clients.
-- Expired rooms are simply invisible via the SELECT policy above; cleanup happens server-side.

-- Restrict session_history to own rows
DROP POLICY IF EXISTS "Anyone can read session history" ON public.session_history;

CREATE POLICY "Users can read own history" ON public.session_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Public leaderboard via SECURITY DEFINER aggregate that never exposes raw rows
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE(user_id uuid, display_name text, total_points bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sh.user_id,
    COALESCE(p.display_name, 'Player') AS display_name,
    SUM(COALESCE((sh.final_scores->>'p1')::int, 0))::bigint AS total_points
  FROM public.session_history sh
  LEFT JOIN public.profiles p ON p.id = sh.user_id
  GROUP BY sh.user_id, p.display_name
  ORDER BY total_points DESC
  LIMIT GREATEST(1, LEAST(limit_count, 100));
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO anon, authenticated;
