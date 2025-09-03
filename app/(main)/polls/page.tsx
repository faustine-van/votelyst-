"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Lock, BarChart3 } from "lucide-react";
import { PollWithOptions } from "@/app/types/database";
import { useEffect, useState } from "react";
import { useAuth } from '@/app/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function PollsPage() {
  const { user, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState<PollWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPolls() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        // Fetch user's polls with their options
        const { data: pollsData, error: pollsError } = await supabase
          .from('polls')
          .select(`
            *,
            options:poll_options(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (pollsError) {
          throw pollsError;
        }

        setPolls(pollsData || []);
      } catch (err) {
        console.error('Error fetching polls:', err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    // Only fetch polls when we have a user and auth is not loading
    if (!authLoading) {
      fetchPolls();
    }
  }, [user, authLoading]);

  // Show loading state while auth is loading
  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Loading...' : 'Loading your polls...'}
          </p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header for unauthenticated users */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">My Polls</h1>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to view and manage your polls.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login?redirectedFrom=/polls">
                <Button>Sign In</Button>
              </Link>
              <Link href="/polls/new">
                <Button variant="outline">Create Anonymous Poll</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container py-8 m-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Error Loading Polls</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header for authenticated users */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">My Polls</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email?.split('@')[0]}
              </span>
              
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Your Polls</h2>
            <p className="text-muted-foreground">
              Browse and manage your {polls.length} poll{polls.length !== 1 ? 's' : ''}.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/polls/new">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Poll
              </Button>
            </Link>
          </div>
        </div>

        {polls && polls.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll: PollWithOptions) => (
              <Link key={poll.id} href={`/polls/results/${poll.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{poll.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{poll.options?.length || 0} options</span>
                      <span>
                        {new Date(poll.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {poll.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {poll.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No polls yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any polls yet. Get started by creating your first poll!
              </p>
              <Link href="/polls/new">
                <Button size="lg">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Your First Poll
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      {/*
      import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BarChart3 } from "lucide-react";
import { PollWithOptions } from "@/app/types/database";

interface PollsListProps {
  polls: PollWithOptions[];
  user: any; 
}

export function PollsList({ polls, user }: PollsListProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">My Polls</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email?.split('@')[0]}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Your Polls</h2>
            <p className="text-muted-foreground">
              Browse and manage your {polls.length} poll{polls.length !== 1 ? 's' : ''}.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/polls/new">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Poll
              </Button>
            </Link>
          </div>
        </div>

        {polls && polls.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll: PollWithOptions) => (
              <Link key={poll.id} href={`/polls/results/${poll.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{poll.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{poll.options?.length || 0} options</span>
                      <span>
                        {new Date(poll.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {poll.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {poll.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No polls yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any polls yet. Get started by creating your first poll!
              </p>
              <Link href="/polls/new">
                <Button size="lg">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Your First Poll
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
      */}
    </div>
  );
}