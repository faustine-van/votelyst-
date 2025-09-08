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