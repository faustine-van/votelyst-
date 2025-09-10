
import { createSupabaseServerClient, getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient'; 
import { type Poll } from '@/app/types/database';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login?redirectedFrom=/dashboard');
  }

  const supabase = await createSupabaseServerClient();

  // Fetch data on the server
  const { data: pollsData, error: pollsError } = await supabase
    .from('polls')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (pollsError) {
    console.error('Error fetching polls:', pollsError);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load dashboard</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  const polls: Poll[] = pollsData || [];
  let totalVotes = 0;

  if (polls.length > 0) {
    const { count, error: votesError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .in('poll_id', polls.map(p => p.id));

    if (votesError) {
      console.error('Error fetching votes count:', votesError);
    } else {
      totalVotes = count || 0;
    }
  }

  // Pass server-fetched data to the client component
  return <DashboardClient user={user} initialPolls={polls} initialTotalVotes={totalVotes} />;
}
