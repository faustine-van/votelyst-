-- Migration to enhance the Votelyst schema
-- Generated on: 2025-09-11

BEGIN;

-- 1. Add ENUM types for poll status and type if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poll_status') THEN
        CREATE TYPE poll_status AS ENUM ('draft', 'active', 'closed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poll_type') THEN
        CREATE TYPE poll_type AS ENUM ('single_choice', 'multiple_choice');
    END IF;
END$$;

-- 2. Enhance the 'polls' table
ALTER TABLE public.polls
    ADD COLUMN IF NOT EXISTS status poll_status NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS poll_type poll_type NOT NULL DEFAULT 'single_choice';

-- 3. Add a 'vote_count' column to 'poll_options'
ALTER TABLE public.poll_options
    ADD COLUMN IF NOT EXISTS vote_count INT NOT NULL DEFAULT 0;

-- 4. Create a function to update the vote count on the 'poll_options' table
CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.poll_options
        SET vote_count = vote_count + 1
        WHERE id = NEW.option_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.poll_options
        SET vote_count = vote_count - 1
        WHERE id = OLD.option_id;
    END IF;
    RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$;

-- 5. Create a trigger on the 'votes' table to automatically update counts
DROP TRIGGER IF EXISTS vote_count_update_trigger ON public.votes;
CREATE TRIGGER vote_count_update_trigger
AFTER INSERT OR DELETE ON public.votes
FOR EACH ROW EXECUTE FUNCTION public.update_vote_count();

-- 6. Add indexes to the 'votes' table for performance
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON public.votes(option_id);

-- 7. Add UNIQUE partial indexes to prevent duplicate votes
-- For logged-in users
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_vote_idx ON public.votes (poll_id, user_id) WHERE (user_id IS NOT NULL);
-- For anonymous users
CREATE UNIQUE INDEX IF NOT EXISTS unique_anon_vote_idx ON public.votes (poll_id, anon_id) WHERE (anon_id IS NOT NULL);

-- 8. Backfill existing vote counts for data consistency
-- This ensures that polls created before this migration have correct counts.
UPDATE public.poll_options po
SET vote_count = (
    SELECT COUNT(*)
    FROM public.votes v
    WHERE v.option_id = po.id
)
WHERE po.vote_count = 0;

COMMIT;
