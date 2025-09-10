
'use client';

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SharePollDialog } from "@/components/share-poll-dialog";
import { UserProfileCard } from "@/components/user-profile-card";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { UserSettings } from "@/components/user-settings";
import { BarChart3, Plus, Users, Eye, Share2, MoreHorizontal, TrendingUp, Settings, User, BarChart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type Poll } from "@/app/types/database";
import { createSupabaseClient } from "@/lib/supabase/client";
import { motion } from 'framer-motion';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { signOut } from "../(auth)/actions";
import { toast } from "sonner";

interface DashboardClientProps {
  user: SupabaseUser;
  initialPolls: Poll[];
  initialTotalVotes: number;
}

export function DashboardClient({ user, initialPolls, initialTotalVotes }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);

  const handleDelete = async (pollId: string) => {
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.from('polls').delete().eq('id', pollId);
      if (error) throw error;
      setPolls((prev) => prev.filter((p) => p.id !== pollId));

      // Recalculate total votes for remaining polls
      const remainingIds = polls.filter((p) => p.id !== pollId).map((p) => p.id);
      if (remainingIds.length === 0) {
        setTotalVotes(0);
      } else {
        const { count, error: countErr } = await supabase
          .from('votes')
          .select('*', { count: 'planned', head: true })
          .in('poll_id', remainingIds);
        if (!countErr) setTotalVotes(count ?? 0);
      }
      toast.success('Poll deleted successfully');
    } catch (error) {
      console.error("Error deleting poll:", error);
      toast.error('Failed to delete poll. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
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

          <motion.div layout>
            <TabsContent value="overview" className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <DashboardAnalytics />
              </motion.div>
            </TabsContent>

            <TabsContent value="polls" className="space-y-6">
              {/* Stats Overview */}
              <motion.div
                className="grid md:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
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
                </motion.div>

                <motion.div variants={itemVariants}>
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
                </motion.div>


              </motion.div>

              {/* Polls List */}
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
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
                  <motion.div
                    className="grid gap-4"
                    variants={containerVariants}
                  >
                    {polls.map((poll) => (
                      <motion.div key={poll.id} variants={itemVariants}>
                        <Card>
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
                                    <DropdownMenuItem asChild>
                                      <Link href={`/polls/${poll.id}/results`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Results
                                      </Link>
                                    </DropdownMenuItem>

                                    <SharePollDialog
                                      pollId={poll.id}
                                      pollQuestion={poll.question}
                                      pollDescription={poll.description || ""}
                                    >
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share Poll
                                      </DropdownMenuItem>
                                    </SharePollDialog>
                                    <DropdownMenuItem asChild>

                                      <Link href={`/polls/${poll.id}/edit`}>
                                        Edit Poll
                                      </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
                                          handleDelete(poll.id);
                                        }
                                      }}
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
                      </motion.div>
                    ))}
                  </motion.div>
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
              </motion.div>
            </TabsContent>

            <TabsContent value="profile">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <UserProfileCard user={user} />
              </motion.div>
            </TabsContent>

            <TabsContent value="settings">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <UserSettings />
              </motion.div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </motion.div>
  )
}
