
-- Replace SECURITY DEFINER RPC with a maintained aggregate table so the leaderboard
-- no longer requires exposing a definer function to anon/authenticated roles.

CREATE TABLE IF NOT EXISTS public.player_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  total_points bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.player_stats TO anon, authenticated;
GRANT ALL ON public.player_stats TO service_role;

ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read player stats" ON public.player_stats;
CREATE POLICY "Public read player stats" ON public.player_stats FOR SELECT USING (true);

-- Backfill from existing session_history
INSERT INTO public.player_stats (user_id, display_name, total_points)
SELECT sh.user_id,
       COALESCE(p.display_name, 'Player'),
       SUM(COALESCE((sh.final_scores->>'p1')::int, 0))::bigint
FROM public.session_history sh
LEFT JOIN public.profiles p ON p.id = sh.user_id
GROUP BY sh.user_id, p.display_name
ON CONFLICT (user_id) DO UPDATE
SET total_points = EXCLUDED.total_points,
    display_name = EXCLUDED.display_name,
    updated_at = now();

-- Trigger to keep stats up to date on new session history rows
CREATE OR REPLACE FUNCTION public.sync_player_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.player_stats (user_id, display_name, total_points)
  VALUES (
    NEW.user_id,
    COALESCE((SELECT display_name FROM public.profiles WHERE id = NEW.user_id), 'Player'),
    COALESCE((NEW.final_scores->>'p1')::int, 0)
  )
  ON CONFLICT (user_id) DO UPDATE
  SET total_points = public.player_stats.total_points + COALESCE((NEW.final_scores->>'p1')::int, 0),
      display_name = EXCLUDED.display_name,
      updated_at = now();
  RETURN NEW;
END;
$$;

-- Prevent direct execution via the API; only the trigger system needs it.
REVOKE ALL ON FUNCTION public.sync_player_stats() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_sync_player_stats ON public.session_history;
CREATE TRIGGER trg_sync_player_stats
AFTER INSERT ON public.session_history
FOR EACH ROW EXECUTE FUNCTION public.sync_player_stats();

-- Remove the SECURITY DEFINER RPC that was flagged as executable by anon/authenticated
DROP FUNCTION IF EXISTS public.get_leaderboard(integer);

-- Lock down other SECURITY DEFINER helpers so the linter no longer flags them as
-- callable via the API. Triggers still fire with the function owner's rights.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
