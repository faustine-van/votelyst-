-- Migration to add view_count to polls table
-- Generated on: 2025-09-11

BEGIN;

-- Add view_count to polls table
ALTER TABLE public.polls
    ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;

-- Function to increment poll view count
CREATE OR REPLACE FUNCTION public.increment_view_count(p_poll_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.polls
    SET view_count = view_count + 1
    WHERE id = p_poll_id;
END;
$$;

COMMIT;
