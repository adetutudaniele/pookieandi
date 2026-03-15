
-- Create rooms table for multiplayer sync
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  player1_name TEXT NOT NULL DEFAULT 'Player 1',
  player2_name TEXT,
  game_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  active_game TEXT NOT NULL DEFAULT 'questions',
  player1_connected BOOLEAN NOT NULL DEFAULT true,
  player2_connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms (no auth in this app)
CREATE POLICY "Anyone can read rooms" ON public.rooms FOR SELECT USING (true);

-- Allow anyone to create rooms
CREATE POLICY "Anyone can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);

-- Allow anyone to update rooms
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);

-- Allow anyone to delete rooms
CREATE POLICY "Anyone can delete rooms" ON public.rooms FOR DELETE USING (true);

-- Index for fast room code lookups
CREATE INDEX idx_rooms_room_code ON public.rooms (room_code);

-- Index for cleanup of expired rooms
CREATE INDEX idx_rooms_expires_at ON public.rooms (expires_at);

-- Enable realtime for the rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
