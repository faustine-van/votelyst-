// PollResultsPage.tsx (Server Component)
import { getPollResults } from '@/app/utils/database';
import { getUser } from '@/lib/supabase/server';
import PollResultsChart from '@/components/PollResultsChart';
import { redirect } from 'next/navigation';

export default async function PollResultsPage({ params }: { params: { id: string } }) {
  const user = await getUser();
  const poll = await getPollResults(params.id);

  if (!poll) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Poll Not Found</h2>
          <p className="text-muted-foreground">The poll you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Check permissions - only poll owner can view results (unless it's an anonymous poll)
  if (poll.user_id && (!user || poll.user_id !== user.id)) {
    redirect('/login?redirectedFrom=/polls/' + params.id + '/results');
  }

  return <PollResultsChart poll={poll} />;
}