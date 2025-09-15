-- Supabase Database Schema for Votelyst Polling App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll options table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure users can only vote once per poll
  UNIQUE(poll_id, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_polls_user_id ON polls(user_id);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_option_id ON votes(option_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_polls_modtime
    BEFORE UPDATE ON polls
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_poll_options_modtime
    BEFORE UPDATE ON poll_options
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();


ALTER TABLE polls ALTER COLUMN user_id DROP NOT NULL;

-- Add requires_login to polls table
ALTER TABLE public.polls ADD COLUMN requires_login BOOLEAN DEFAULT false NOT NULL;
-- Modify votes table for anonymous voting
ALTER TABLE public.votes ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.votes ADD COLUMN anon_id UUID;

 -- Replace unique constraint with partial indexes for better uniqueness control
 -- Note: The constraint name 'votes_poll_id_user_id_key' might be different in your database.
 -- Please check the exact name in your Supabase dashboard under Database -> Tables -> votes -> Constraints.
ALTER TABLE public.votes DROP CONSTRAINT votes_poll_id_user_id_key;
ALTER TABLE public.votes ADD CONSTRAINT user_or_anon_vote CHECK ((user_id IS NOT NULL AND anon_id IS NULL) OR (user_id IS
      NULL AND anon_id IS NOT NULL));
CREATE UNIQUE INDEX unique_user_vote ON public.votes (poll_id, user_id) WHERE (anon_id IS NULL);
CREATE UNIQUE INDEX unique_anon_vote ON public.votes (poll_id, anon_id) WHERE (user_id IS NULL);








-- Row Level Security (RLS) policies for Votelyst Polling App

-- Enable Row Level Security on tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for polls table
-- 1. Users can view all polls (public access for viewing)
CREATE POLICY "Polls are viewable by everyone"
  ON polls FOR SELECT
  USING (true);

-- 2. Users can only insert their own polls
CREATE POLICY "Users can create their own polls"
  ON polls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can only update their own polls
CREATE POLICY "Users can update their own polls"
  ON polls FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Users can only delete their own polls
CREATE POLICY "Users can delete their own polls"
  ON polls FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for poll_options table
-- 1. Everyone can view poll options
CREATE POLICY "Poll options are viewable by everyone"
  ON poll_options FOR SELECT
  USING (true);

-- 2. Users can only insert options for their own polls
CREATE POLICY "Users can create options for their own polls"
  ON poll_options FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM polls WHERE id = poll_options.poll_id));

-- 3. Users can only update options for their own polls
CREATE POLICY "Users can update options for their own polls"
  ON poll_options FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM polls WHERE id = poll_options.poll_id));

-- 4. Users can only delete options for their own polls
CREATE POLICY "Users can delete options for their own polls"
  ON poll_options FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM polls WHERE id = poll_options.poll_id));

-- Create policies for votes table
-- 1. Everyone can view votes (for results)
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

-- 2. Users can cast votes based on poll requirements
DROP POLICY IF EXISTS "Authenticated users can cast votes" ON votes;
CREATE POLICY "Users can cast votes based on poll requirements"
  ON votes FOR INSERT
  WITH CHECK (
    (
      -- Case 1: Private poll (requires login)
      (SELECT requires_login FROM polls WHERE id = votes.poll_id) = true AND
      auth.uid() = votes.user_id
    ) OR (
      -- Case 2: Public poll (does not require login)
      (SELECT requires_login FROM polls WHERE id = votes.poll_id) = false
    )
  );

-- 3. Users can only update their own votes
CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Users can only delete their own votes
CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  USING (auth.uid() = user_id);



    