// Database utility functions for Votelyst application
import { supabase } from './supabase';
import { Poll, PollOption, Vote, PollWithOptions, PollWithResults } from '../types/database';

// Poll operations
export async function createPoll(userId: string, question: string, description: string | null, options: string[]) {
  // Insert the poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      user_id: userId,
      question,
      description,
    })
    .select()
    .single();

  if (pollError) throw pollError;

  // Insert the options
  const optionsToInsert = options.map(option_text => ({
    poll_id: poll.id,
    option_text,
  }));

  const { data: pollOptions, error: optionsError } = await supabase
    .from('poll_options')
    .insert(optionsToInsert)
    .select();

  if (optionsError) throw optionsError;

  return { ...poll, options: pollOptions };
}

export async function getPoll(pollId: string): Promise<PollWithOptions | null> {
  // Get the poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .single();

  if (pollError) return null;

  // Get the options
  const { data: options, error: optionsError } = await supabase
    .from('poll_options')
    .select('*')
    .eq('poll_id', pollId);

  if (optionsError) return null;

  return { ...poll, options };
}

export async function getUserPolls(userId: string): Promise<Poll[]> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllPolls(): Promise<Poll[]> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUserVoteCount(userId: string): Promise<number> {
  const { data: polls, error: pollsError } = await supabase
    .from('polls')
    .select('id')
    .eq('user_id', userId);

  if (pollsError) throw pollsError;

  const pollIds = polls.map(p => p.id);

  const { count, error: votesError } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .in('poll_id', pollIds);

  if (votesError) throw votesError;

  return count || 0;
}

export async function updatePoll(pollId: string, question: string, description: string | null) {
  const { data, error } = await supabase
    .from('polls')
    .update({ question, description })
    .eq('id', pollId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePoll(pollId: string) {
  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId);

  if (error) throw error;
}

// Vote operations
export async function castVote(userId: string, pollId: string, optionId: string): Promise<Vote> {
  const { data, error } = await supabase
    .from('votes')
    .insert({
      user_id: userId,
      poll_id: pollId,
      option_id: optionId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function hasUserVoted(userId: string, pollId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('user_id', userId)
    .eq('poll_id', pollId)
    .single();

  if (error) return false;
  return !!data;
}

export async function getPollResults(pollId: string): Promise<PollWithResults | null> {
  // Get the poll
  const pollData = await getPoll(pollId);
  if (!pollData) return null;

  // Get vote counts for each option
  const { data: voteData, error: voteError } = await supabase
    .from('votes')
    .select('option_id')
    .eq('poll_id', pollId);

  if (voteError) return null;

  // Count votes for each option
  const voteCounts: Record<string, number> = {};
  voteData.forEach(vote => {
    voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
  });

  // Format results
  const results = pollData.options.map(option => ({
    option_id: option.id,
    option_text: option.option_text,
    vote_count: voteCounts[option.id] || 0,
  }));

  return {
    ...pollData,
    results,
    total_votes: voteData.length,
  };
}