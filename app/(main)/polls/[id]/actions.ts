'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function incrementPollViewCount(pollId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('increment_view_count', {
    p_poll_id: pollId,
  });

  if (error) {
    console.error('Error incrementing poll view count:', error);
  }
}
