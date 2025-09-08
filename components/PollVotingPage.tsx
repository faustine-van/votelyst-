'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  ArrowLeft, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  Share2,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getAnonId } from '@/lib/utils';
import { SharePollDialog } from '@/components/share-poll-dialog';

interface PollOption {
  id: string;
  option_text: string;
  poll_id: string;
}

interface Poll {
  id: string;
  question: string;
  description?: string;
  created_at: string;
  user_id: string;
  options: PollOption[];
  requires_login: boolean;
}

interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string | null;
  anon_id?: string | null;
  created_at: string;
}

interface PollVotingPageProps {
  pollId: string;
}

export function PollVotingPage({ pollId }: PollVotingPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string>('');
  

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const supabase = await createSupabaseClient();
        
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select(`
            id,
            question,
            description,
            created_at,
            user_id,
            requires_login,
            options:poll_options (
              id,
              option_text,
              poll_id
            )
          `)
          .eq('id', pollId)
          .single();

        if (pollError) {
          console.error('Error fetching poll:', pollError);
          if (pollError.code === 'PGRST116') {
            setError('Poll not found');
          } else {
            setError(`Error loading poll: ${pollError.message}`);
          }
          return;
        }

        if (!pollData) {
          setError('Poll not found');
          return;
        }

        if (pollData.requires_login && !user && !authLoading) {
          router.push(`/login?redirectedFrom=/polls/${pollId}`);
          return;
        }

        setPoll(pollData);

        // Check for existing vote
        let voteQuery = supabase.from('votes').select('*').eq('poll_id', pollId);
        if (user?.id) {
          voteQuery = voteQuery.eq('user_id', user.id);
        } else if (!pollData.requires_login) {
          const anonId = getAnonId();
          if (anonId) {
            voteQuery = voteQuery.eq('anon_id', anonId);
          } else {
            return;
          }
        } else {
          return;
        }

        const { data: voteData, error: voteError } = await voteQuery.maybeSingle();

        if (voteError) {
          console.error('Error checking vote:', voteError);
        } else if (voteData) {
          setUserVote(voteData);
          setSelectedOption(voteData.option_id);
        }

      } catch (error) {
        console.error('Unexpected error fetching poll:', error);
        setError('An unexpected error occurred while loading the poll');
      } finally {
        setLoading(false);
      }
    };

    if (pollId && !authLoading) {
      fetchPoll();
    } else if (!pollId) {
      setError('No poll ID provided');
      setLoading(false);
    }
  }, [pollId, user?.id, authLoading, router]);

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    if (userVote) {
      toast.error('You have already voted on this poll');
      return;
    }

    if (poll?.requires_login && !user) {
      router.push(`/login?redirectedFrom=/polls/${pollId}`);
      return;
    }

    setVoting(true);
    try {
      const supabase = createSupabaseClient();
      
      const votePayload: {
        poll_id: string;
        option_id: string;
        user_id?: string;
        anon_id?: string;
      } = {
        poll_id: pollId,
        option_id: selectedOption,
      };

      if (user) {
        votePayload.user_id = user.id;
      } else if (!poll?.requires_login) {
        votePayload.anon_id = getAnonId();
      } else {
        toast.error('You must be logged in to vote on this poll.');
        setVoting(false);
        return;
      }

      const { data, error } = await supabase
        .from('votes')
        .insert(votePayload)
        .select()
        .single();

      if (error) {
        console.error('Voting error:', error);
        
        if (error.code === '23505') {
          toast.error('You have already voted on this poll');
          let voteCheckQuery = supabase.from('votes').select().eq('poll_id', pollId);
          if (user) {
            voteCheckQuery = voteCheckQuery.eq('user_id', user.id);
          } else {
            voteCheckQuery = voteCheckQuery.eq('anon_id', getAnonId());
          }
          const { data: existingVote } = await voteCheckQuery.single();
          if (existingVote) setUserVote(existingVote);

        } else {
          toast.error(`Failed to submit vote: ${error.message}`);
        }
      } else if (data) {
        toast.success('Vote submitted successfully!');
        setUserVote(data);
        
        setTimeout(() => {
          router.push(`/polls/${pollId}/results`);
        }, 1500);
      }
    } catch (error) {
      console.error('Unexpected error submitting vote:', error);
      toast.error('An unexpected error occurred while voting');
    } finally {
      setVoting(false);
    }
  };

  

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-bold text-foreground">Poll</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container py-16">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {error.includes('not found') ? 'Poll Not Found' : 'Error Loading Poll'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Link href="/">
                <Button variant="outline">Go Home</Button>
              </Link>
              {user && (
                <Link href="/polls">
                  <Button variant="outline">My Polls</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwnPoll = user && poll.user_id === user.id;
  const hasVoted = !!userVote;
  const canVote = !poll.requires_login || !!user;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={user ? "/polls" : "/"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {user ? "Back to My Polls" : "Back to Home"}
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Vote on Poll</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <span className="text-sm text-muted-foreground">
                  {user.email?.split('@')[0]}
                </span>
              ) : (
                <Link href={`/login?redirectedFrom=/polls/${pollId}`}>
                  <Button variant="outline">Sign In</Button>
                </Link>
              )}
              <SharePollDialog pollId={poll.id} pollQuestion={poll.question} pollDescription={poll.description}>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </SharePollDialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Poll Information */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <h1 className="text-3xl font-bold text-foreground">{poll.question}</h1>
                {poll.description && (
                  <p className="text-muted-foreground text-lg">{poll.description}</p>
                )}
              </div>
              {isOwnPoll && (
                <Badge variant="secondary" className="ml-4">Your Poll</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(poll.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{poll.options.length} options</span>
              </div>
            </div>
          </div>

          {/* Voting Status */}
          {hasVoted && (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">You have already voted on this poll</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  Your vote has been recorded. You can view the results or share this poll with others.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Authentication Notice */}
          {poll.requires_login && !user && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Lock className="h-5 w-5" />
                  <span className="font-medium">Sign in required to vote</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                  This is a private poll. You need to be signed in to vote.
                </p>
                <Link href={`/login?redirectedFrom=/polls/${pollId}`}>
                  <Button size="sm" className="mt-3">
                    Sign In to Vote
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Voting Form */}
          <Card>
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
              <CardDescription>
                {hasVoted 
                  ? "Your current vote is highlighted below"
                  : canVote 
                    ? "Select an option and click vote to submit your choice"
                    : "Sign in to participate in this poll"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={selectedOption} 
                onValueChange={setSelectedOption}
                disabled={!canVote || hasVoted}
              >
                {poll.options.map((option) => (
                  <div 
                    key={option.id} 
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      hasVoted && option.id === userVote?.option_id
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : selectedOption === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem 
                      value={option.id} 
                      id={option.id}
                      disabled={!canVote || hasVoted}
                    />
                    <Label 
                      htmlFor={option.id} 
                      className={`flex-1 cursor-pointer text-base ${
                        hasVoted && option.id === userVote?.option_id
                          ? 'font-medium text-green-700 dark:text-green-400'
                          : ''
                      }`}
                    >
                      {option.option_text}
                      {hasVoted && option.id === userVote?.option_id && (
                        <span className="ml-2 text-sm text-green-600 dark:text-green-500">
                          (Your vote)
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {canVote && !hasVoted && (
                <Button 
                  onClick={handleVote} 
                  disabled={!selectedOption || voting}
                  className="w-full"
                  size="lg"
                >
                  {voting ? 'Submitting Vote...' : 'Submit Vote'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            {(hasVoted || isOwnPoll) && (
              <Link href={`/polls/${pollId}/results`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Results
                </Button>
              </Link>
            )}
            
            {isOwnPoll && (
              <Link href={`/polls/${pollId}/edit`}>
                <Button variant="outline">
                  Edit Poll
                </Button>
              </Link>
            )}

            <SharePollDialog pollId={poll.id} pollQuestion={poll.question} pollDescription={poll.description}>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Poll
              </Button>
            </SharePollDialog>
          </div>

          {/* Poll Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  This poll was created on {new Date(poll.created_at).toLocaleDateString()}
                  {isOwnPoll && ' by you'}
                </p>
                {!user && (
                  <p className="mt-1">
                    <Link href="/register" className="text-primary hover:underline">
                      Create an account
                    </Link>
                    {' '}to start creating your own polls
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
