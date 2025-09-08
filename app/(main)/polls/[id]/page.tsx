// pages/polls/[id]/page.tsx
import { PollVotingPage } from '@/components/PollVotingPage';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for better SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const supabase = await createSupabaseServerClient();
    const { data: poll } = await supabase
      .from('polls')
      .select('question, description')
      .eq('id', id)
      .single();
    
    if (poll) {
      return {
        title: `Vote: ${poll.question}`,
        description: poll.description || 'Cast your vote on this poll',
        openGraph: {
          title: poll.question,
          description: poll.description || 'Cast your vote on this poll',
          type: 'website',
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: 'Poll - Vote Now',
    description: 'Cast your vote on this poll',
  };
}

export default async function PollPage({ params }: PageProps) {
  const { id } = await params;
  
  // Validate the ID format (assuming UUIDs)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Poll ID</h1>
          <p className="text-muted-foreground">The poll ID provided is not valid.</p>
        </div>
      </div>
    );
  }
  
  return <PollVotingPage pollId={id} />;
}