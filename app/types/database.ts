// Database types for Votelyst application

// User type from Supabase Auth
export type User = {
  id: string;
  email?: string;
  full_name?: string;
  created_at: string;
};

// Poll type
export type Poll = {
  id: string;
  user_id: string | null;
  question: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

// Poll option type
export type PollOption = {
  id: string;
  poll_id: string;
  option_text: string;
  created_at: string;
  updated_at: string;
};

// Vote type
export type Vote = {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
};

// Poll with options type (for joined queries)
export type PollWithOptions = Poll & {
  options: PollOption[];
};

// Poll results type (for aggregated vote data)
export type PollResult = {
  option_id: string;
  option_text: string;
  vote_count: number;
};

// Poll with results type (for displaying poll results)
export type PollWithResults = Poll & {
  options: PollOption[];
  results: PollResult[];
  total_votes: number;
};