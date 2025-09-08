'use client';

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SharePollDialog } from "@/components/share-poll-dialog"
import { UserProfileCard } from "@/components/user-profile-card"
import { DashboardAnalytics } from "@/components/dashboard-analytics"
import { UserSettings } from "@/components/user-settings"
import { BarChart3, Plus, Users, Eye, Share2, MoreHorizontal, TrendingUp, Settings, User, BarChart, Lock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type Poll } from "@/app/types/database"
import { useAuth } from "@/app/context/AuthContext"
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview")
  const [polls, setPolls] = useState<Poll[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectedFrom=/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const supabase = createSupabaseClient();
          const { data: pollsData, error: pollsError } = await supabase
            .from('polls')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (pollsError) {
            console.error('Error fetching polls:', pollsError);
          } else {
            setPolls(pollsData || []);
          }

          if (pollsData && pollsData.length > 0) {
            const { count, error: votesError } = await supabase
              .from('votes')
              .select('*', { count: 'exact', head: true })
              .in('poll_id', pollsData.map(p => p.id));

            if (votesError) {
              console.error('Error fetching votes:', votesError);
            } else {
              setTotalVotes(count || 0);
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
      setLoading(false);
    }

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading])

  const handleDelete = async (pollId: string) => {
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.from('polls').delete().eq('id', pollId);
      if (error) throw error;
      setPolls(polls.filter((p) => p.id !== pollId))
    } catch (error) {
      console.error("Error deleting poll:", error)
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // Navigation will be handled by the auth state change
  };

  // Show loading state
  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to access your dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
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
            <Link href="/" className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Votelyst</h1>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.email?.split('@')[0]}
              </span>
              <Link href="/polls/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Poll
                </Button>
              </Link>
              <Button onClick={handleSignOut}>Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">Manage your polls and view insights</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              My Polls
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardAnalytics />
          </TabsContent>

          <TabsContent value="polls" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{polls.length}</div>
                  <p className="text-xs text-muted-foreground">Your active polls</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVotes}</div>
                  <p className="text-xs text-muted-foreground">Across all polls</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Votes per Poll</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {polls.length > 0 ? Math.round(totalVotes / polls.length) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Average engagement</p>
                </CardContent>
              </Card>
            </div>

            {/* Polls List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">Your Polls</h3>
                <Link href="/polls/new">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Poll
                  </Button>
                </Link>
              </div>

              {polls.length > 0 ? (
                <div className="grid gap-4">
                  {polls.map((poll) => (
                    <Card key={poll.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg text-balance">{poll.question}</CardTitle>
                            {poll.description && (
                              <CardDescription className="text-pretty">{poll.description}</CardDescription>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Created {new Date(poll.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={"default"}>active</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/polls/${poll.id}/results`}>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Results
                                  </DropdownMenuItem>
                                </Link>
                                <SharePollDialog
                                  pollId={poll.id}
                                  pollTitle={poll.question}
                                  pollDescription={poll.description || ""}
                                >
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share Poll
                                  </DropdownMenuItem>
                                </SharePollDialog>
                                <Link href={`/polls/${poll.id}/edit`}>
                                  <DropdownMenuItem>
                                    Edit Poll
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(poll.id)}
                                  className="text-red-500"
                                >
                                  Delete Poll
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No polls yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first poll to get started!
                    </p>
                    <Link href="/polls/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Poll
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <UserProfileCard user={user} />
          </TabsContent>

          <TabsContent value="settings">
            <UserSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}