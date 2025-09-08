'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Poll, PollOption, PollWithOptions } from '../../types/database';

export async function createPoll(
  userId: string | null,
  question: string,
  description: string | null,
  options: string[],
  requires_login: boolean
) {
  const supabase = await createSupabaseServerClient();

  // Insert poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({ user_id: userId, question, description, requires_login })
    .select()
    .single();
  if (pollError) throw pollError;

  // Insert options
  const { data: pollOptions, error: optionsError } = await supabase
    .from('poll_options')
    .insert(options.map(option_text => ({ poll_id: poll.id, option_text })))
    .select();
  if (optionsError) throw optionsError;

  return { ...poll, options: pollOptions };
}

export async function getPoll(pollId: string): Promise<PollWithOptions | null> {
  const supabase = await createSupabaseServerClient();

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .single();
  if (pollError) return null;

  const { data: options, error: optionsError } = await supabase
    .from('poll_options')
    .select('*')
    .eq('poll_id', pollId);
  if (optionsError) return null;

  return { ...poll, options };
}

export async function updatePoll(
  pollId: string,
  question: string,
  description: string | null,
  options: { id?: string; option_text: string }[],
  requires_login: boolean
) {
  const supabase = await createSupabaseServerClient();

  // Update poll details
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .update({ question, description, requires_login })
    .eq('id', pollId)
    .select()
    .single();
  if (pollError) throw pollError;

  // Get existing option IDs
  const { data: existingOptions } = await supabase
    .from('poll_options')
    .select('id')
    .eq('poll_id', pollId);
  const existingIds = existingOptions?.map(o => o.id) || [];

  const toUpdate = options.filter(o => o.id && existingIds.includes(o.id));
  const toInsert = options.filter(o => !o.id);
  const toDelete = existingIds.filter(id => !options.some(o => o.id === id));

  if (toUpdate.length > 0) {
    const { error } = await supabase.from('poll_options').upsert(toUpdate);
    if (error) throw error;
  }

  if (toInsert.length > 0) {
    const { error } = await supabase
      .from('poll_options')
      .insert(toInsert.map(o => ({ poll_id: pollId, option_text: o.option_text })));
    if (error) throw error;
  }

  if (toDelete.length > 0) {
    const { error } = await supabase.from('poll_options').delete().in('id', toDelete);
    if (error) throw error;
  }

  return poll;
}
