'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function voteOnPoll(pollId: string, formData: FormData) {
  const optionId = formData.get('option');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to vote.' };
  }

  if (!optionId) {
    return { error: 'Please select an option.' };
  }

  const { error } = await supabase.from('votes').insert([
    {
      poll_id: pollId,
      option_id: optionId.toString(),
      user_id: user.id,
    },
  ]);

  if (error) {
    if (error.code === '23505') {
      // unique constraint violation, user has already voted.
      return { error: 'You have already voted on this poll.', alreadyVoted: true };
    }
    console.error('Error voting:', error);
    return { error: 'An error occurred while submitting your vote.' };
  }

  revalidatePath(`/polls/${pollId}`);
  revalidatePath(`/polls/${pollId}/results`);
  
  return { success: true };
}