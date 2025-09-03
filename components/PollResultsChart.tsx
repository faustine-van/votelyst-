// PollResultsChart.tsx
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { type PollWithResults } from '@/app/types/database';
import { useAuth } from '@/app/context/AuthContext';
import { Lock, BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function PollResultsChart({ poll }: { poll: PollWithResults }) {
  const { user, loading } = useAuth();

  const data = poll.results.map(result => ({
    name: result.option_text,
    votes: result.vote_count,
  }));

  const totalVotes = data.reduce((sum, item) => sum + item.votes, 0);

  // Check if user has permission to view results
  const hasPermission = !poll.user_id || (user && poll.user_id === user.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
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
                  <h1 className="text-xl font-bold text-foreground">Poll Results</h1>
                </div>
              </div>
              {!user && (
                <div className="flex items-center gap-4">
                  <Link href="/auth/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="container py-16">
          <div className="text-center max-w-md mx-auto">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-6">
              You can only view results for polls you created. Sign in to view your poll results.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login">
                <Button>Sign In</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={user ? "/dashboard" : "/"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {user ? "Back to Dashboard" : "Back to Home"}
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Poll Results</h1>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user.email?.split('@')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{poll.question}</h1>
            {poll.description && (
              <p className="text-muted-foreground text-lg">{poll.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>Total votes: {totalVotes}</span>
              <span>Created: {new Date(poll.created_at).toLocaleDateString()}</span>
              {poll.user_id && user && poll.user_id === user.id && (
                <span className="text-green-600">Your poll</span>
              )}
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votes" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Results Table */}
          <div className="mt-8 bg-card rounded-lg border overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
              <div className="space-y-3">
                {data.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="font-medium">{result.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold">{result.votes} votes</span>
                      <span className="text-sm text-muted-foreground">
                        {totalVotes > 0 ? ((result.votes / totalVotes) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}