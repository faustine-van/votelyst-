'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar,
  Eye,
  Share2,
  Award,
  Clock,
  Activity,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '@/app/context/AuthContext';
import { createSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface AnalyticsData {
  totalPolls: number;
  totalVotes: number;
  avgVotesPerPoll: number;
  recentActivity: ActivityItem[];
  pollsOverTime: TimeSeriesData[];
  votesOverTime: TimeSeriesData[];
  topPolls: TopPoll[];
  engagementMetrics: EngagementMetric[];
}

interface ActivityItem {
  id: string;
  type: 'poll_created' | 'vote_received' | 'poll_shared';
  description: string;
  timestamp: string;
  pollId?: string;
  pollTitle?: string;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

interface TopPoll {
  id: string;
  question: string;
  votes: number;
  views: number;
  engagement: number;
  createdAt: string;
}

interface EngagementMetric {
  name: string;
  value: number;
  color: string;
}

export function DashboardAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const supabase = createSupabaseClient();

        // Fetch basic poll data
        const { data: polls, error: pollsError } = await supabase
          .from('polls')
          .select(`
            id,
            question,
            description,
            created_at,
            votes (
              id,
              created_at,
              option_id
            ),
            poll_options (
              id,
              option_text
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (pollsError) throw pollsError;

        // Process the data
        const totalPolls = polls?.length || 0;
        const totalVotes = polls?.reduce((sum, poll) => sum + (poll.votes?.length || 0), 0) || 0;
        const totalViews = totalPolls * 15; // Mock view data - in real app, track this
        const avgVotesPerPoll = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;

        // Generate time series data
        const now = new Date();
        const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
        const timeSeriesData = [];
        const pollsOverTimeData: TimeSeriesData[] = [];
        const votesOverTimeData: TimeSeriesData[] = [];
        
        for (let i = daysBack - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const pollsOnDate = polls?.filter(poll => 
            poll.created_at.startsWith(dateStr)
          ).length || 0;
          
          const votesOnDate = polls?.reduce((sum, poll) => {
            const votesOnThisDate = poll.votes?.filter(vote => 
              vote.created_at.startsWith(dateStr)
            ).length || 0;
            return sum + votesOnThisDate;
          }, 0) || 0;

          timeSeriesData.push({
            date: dateStr,
            polls: pollsOnDate,
            votes: votesOnDate
          });

          pollsOverTimeData.push({
            date: dateStr,
            count: pollsOnDate
          });

          votesOverTimeData.push({
            date: dateStr,
            count: votesOnDate
          });
        }

        // Top performing polls
        const topPolls: TopPoll[] = polls?.map(poll => ({
          id: poll.id,
          question: poll.question,
          votes: poll.votes?.length || 0,
          views: Math.floor(Math.random() * 100) + (poll.votes?.length || 0) * 2, // Mock views
          engagement: ((poll.votes?.length || 0) / Math.max(Math.floor(Math.random() * 100) + 10, 1)) * 100,
          createdAt: poll.created_at
        })).sort((a, b) => b.votes - a.votes).slice(0, 5) || [];

        // Recent activity
        const recentActivity: ActivityItem[] = [];
        
        polls?.forEach(poll => {
          recentActivity.push({
            id: `poll-${poll.id}`,
            type: 'poll_created',
            description: `Created poll: "${poll.question}"`,
            timestamp: poll.created_at,
            pollId: poll.id,
            pollTitle: poll.question
          });

          poll.votes?.forEach(vote => {
            recentActivity.push({
              id: `vote-${vote.id}`,
              type: 'vote_received',
              description: `Received vote on "${poll.question}"`,
              timestamp: vote.created_at,
              pollId: poll.id,
              pollTitle: poll.question
            });
          });
        });

        recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Engagement metrics
        const engagementMetrics: EngagementMetric[] = [
          { name: 'High Engagement', value: topPolls.filter(p => p.votes > avgVotesPerPoll).length, color: '#22c55e' },
          { name: 'Medium Engagement', value: topPolls.filter(p => p.votes <= avgVotesPerPoll && p.votes > 0).length, color: '#f59e0b' },
          { name: 'Low Engagement', value: topPolls.filter(p => p.votes === 0).length, color: '#ef4444' }
        ];

        setData({
          totalPolls,
          totalVotes,
          totalViews,
          avgVotesPerPoll,
          recentActivity: recentActivity.slice(0, 10),
          pollsOverTime: pollsOverTimeData,
          votesOverTime: votesOverTimeData,
          topPolls,
          engagementMetrics
        });

      } catch (error) {
        console.error('Error fetching analytics:', JSON.stringify(error, null, 2));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load analytics data</p>
      </div>
    );
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'poll_created':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'vote_received':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'poll_shared':
        return <Share2 className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPolls}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalPolls > 0 ? '+1 from last week' : 'Create your first poll'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalVotes}</div>
            <p className="text-xs text-muted-foreground">
              Across all your polls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Poll page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgVotesPerPoll}</div>
            <p className="text-xs text-muted-foreground">
              Votes per poll
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analytics Overview</h3>
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range as any)}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="polls">Top Polls</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Polls Created Over Time</CardTitle>
                <CardDescription>Track your poll creation activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={data.pollsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value) => [value, 'Polls Created']}
                      />
                      <Line type="monotone" dataKey="polls" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Votes Received Over Time</CardTitle>
                <CardDescription>Monitor voting activity on your polls</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={data.votesOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value) => [value, 'Votes']}
                      />
                      <Bar dataKey="votes" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="polls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Polls</CardTitle>
              <CardDescription>Your most successful polls by votes and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topPolls.length > 0 ? (
                <div className="space-y-4">
                  {data.topPolls.map((poll, index) => (
                    <div key={poll.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium line-clamp-1">{poll.question}</h4>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(poll.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold">{poll.votes}</div>
                          <div className="text-xs text-muted-foreground">Votes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{poll.views}</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{poll.engagement.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Engagement</div>
                        </div>
                        <Link href={`/polls/${poll.id}/results`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No polls yet</h3>
                  <p className="text-muted-foreground">Create some polls to see your top performers here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest poll activity and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {data.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
                      </div>
                      {activity.pollId && (
                        <Link href={`/polls/${activity.pollId}/results`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                  <p className="text-muted-foreground">Start creating polls to see your activity here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Distribution</CardTitle>
                <CardDescription>How your polls perform by engagement level</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={data.engagementMetrics}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.engagementMetrics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Tips</CardTitle>
                <CardDescription>Improve your poll performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Clear Questions</h4>
                      <p className="text-sm text-muted-foreground">Make your poll questions specific and easy to understand</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Share2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Share Widely</h4>
                      <p className="text-sm text-muted-foreground">Share your polls on social media and with your network</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Timing Matters</h4>
                      <p className="text-sm text-muted-foreground">Post polls when your audience is most active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}