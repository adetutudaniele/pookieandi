-- Manual scoreboard adjustments belong to the room's running total and can
-- happen while no game session is active, so the session link is optional.
ALTER TABLE public.score_events ALTER COLUMN game_session_id DROP NOT NULL;

-- The public read policy was written against the session join; keep live-room
-- visibility working for events that have no session.
DROP POLICY IF EXISTS "read live score events" ON public.score_events;
CREATE POLICY "read live score events" ON public.score_events
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.participants p
    JOIN public.rooms r ON r.id = p.room_id
    WHERE p.id = score_events.participant_id
      AND r.expires_at > now()
  )
);