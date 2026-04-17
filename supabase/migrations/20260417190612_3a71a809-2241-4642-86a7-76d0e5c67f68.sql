-- Table to store temporary OAuth states (CSRF protection)
CREATE TABLE public.twitch_auth_state (
  state TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.twitch_auth_state ENABLE ROW LEVEL SECURITY;

-- No policies: only edge functions (service role) can access this table.
-- Auto-cleanup: delete states older than 10 minutes on each insert
CREATE OR REPLACE FUNCTION public.cleanup_old_twitch_states()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.twitch_auth_state
  WHERE created_at < now() - interval '10 minutes';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_twitch_states
AFTER INSERT ON public.twitch_auth_state
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_twitch_states();

-- Add twitch_id to profiles to uniquely identify Twitch users
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS twitch_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS twitch_avatar_url TEXT;