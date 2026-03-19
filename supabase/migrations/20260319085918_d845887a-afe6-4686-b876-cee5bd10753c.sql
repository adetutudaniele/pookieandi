
-- Add shown_prompts tracking to rooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS shown_prompts jsonb NOT NULL DEFAULT '{}';

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Session history
CREATE TABLE public.session_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_name text NOT NULL DEFAULT '',
  final_scores jsonb NOT NULL DEFAULT '{"p1": 0, "p2": 0}',
  rounds_played integer NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 0,
  played_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read session history" ON public.session_history FOR SELECT USING (true);
CREATE POLICY "Users can insert own history" ON public.session_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
