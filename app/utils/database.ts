// Database utility functions for Votelyst application
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Poll, PollOption, Vote, PollWithOptions, PollWithResults } from '../types/database';







export async function getUserPolls(userId: string): Promise<Poll[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllPolls(): Promise<Poll[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUserVoteCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();

  // Fetch polls created by user
  const { data: polls, error: pollsError } = await supabase
    .from('polls')
    .select('id')
    .eq('user_id', userId);
  if (pollsError) throw pollsError;

  if (!polls || polls.length === 0) return 0;
  const pollIds = polls.map(p => p.id);

  // Count votes
  const { count, error: votesError } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .in('poll_id', pollIds);
  if (votesError) throw votesError;

  return count || 0;
}



export async function deletePoll(pollId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('polls').delete().eq('id', pollId);
  if (error) throw error;
}

// Vote operations
export async function castVote(userId: string, pollId: string, optionId: string): Promise<Vote> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('votes')
    .insert({ user_id: userId, poll_id: pollId, option_id: optionId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function hasUserVoted(userId: string, pollId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('user_id', userId)
    .eq('poll_id', pollId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

export async function getPoll(pollId: string): Promise<PollWithOptions | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('polls')
    .select('*, options:poll_options(*)')
    .eq('id', pollId)
    .single();

  if (error) {
    console.error('Error fetching poll:', error);
    return null;
  }
  if (!data) return null;

  return {
    ...data,
    options: data.options || [],
  };
}

export async function getPollResults(pollId: string): Promise<PollWithResults | null> {
  const pollData = await getPoll(pollId);
  if (!pollData) return null;

  const supabase = await createSupabaseServerClient();
  const { data: voteData, error: voteError } = await supabase
    .from('votes')
    .select('option_id')
    .eq('poll_id', pollId);
  if (voteError) return null;

  const voteCounts = voteData.reduce<Record<string, number>>((acc, vote) => {
    acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
    return acc;
  }, {});

  return {
    ...pollData,
    results: pollData.options.map(option => ({
      option_id: option.id,
      option_text: option.option_text,
      vote_count: voteCounts[option.id] || 0,
    })),
    total_votes: voteData.length,
  };
}
