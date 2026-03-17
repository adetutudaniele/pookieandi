
-- Add messages column to rooms table for chat
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS messages jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add scores column to rooms table for scoreboard
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS scores jsonb NOT NULL DEFAULT '{"p1": 0, "p2": 0}'::jsonb;
