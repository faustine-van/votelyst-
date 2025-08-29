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
import { BarChart3, Plus, Users, Eye, Share2, MoreHorizontal, TrendingUp, Settings, User, BarChart } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/app/utils/supabase"
import { getUserPolls, getUserVoteCount } from "@/app/utils/database"
import { type User as AuthUser } from '@supabase/supabase-js'
import { type Poll } from "@/app/types/database"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [user, setUser] = useState<AuthUser | null>(null)
  const [polls, setPolls] = useState<Poll[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const userPolls = await getUserPolls(user.id)
        setPolls(userPolls)
        const userVoteCount = await getUserVoteCount(user.id)
        setTotalVotes(userVoteCount)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const userProfile = user ? {
      name: user.user_metadata.full_name || "Anonymous",
      email: user.email || "",
      avatar: user.user_metadata.avatar_url || "/professional-avatar.png",
      bio: "Product manager passionate about user feedback and data-driven decisions.",
      location: "San Francisco, CA",
      joinDate: user.created_at,
      pollsCreated: polls.length,
      totalVotes: totalVotes,
      tier: "pro" as const,
  } : null

  if (loading) {
      return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">PollCraft</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Poll
                </Button>
              </Link>
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
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVotes}</div>
                  <p className="text-xs text-muted-foreground">+180 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Response Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Polls List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">Your Polls</h3>
                <Link href="/create">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Poll
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4">
                {polls.map((poll) => (
                  <Card key={poll.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg text-balance">{poll.question}</CardTitle>
                          {poll.description && (
                            <CardDescription className="text-pretty">{poll.description}</CardDescription>
                          )}
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
                                className="text-destructive"
                                onClick={() => handleDelete(poll.id)}
                              >
                                Delete Poll
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {/* {poll.votes} votes */}
                          </span>
                          {/* <span>{poll.responses} responses</span> */}
                        </div>
                        <span>Created {new Date(poll.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {userProfile && <UserProfileCard user={userProfile} />}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <UserSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}