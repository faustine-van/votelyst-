'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts';
import { useAuth } from '@/app/context/AuthContext';
import { createSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatDate } from '@/app/utils/date';
import { cn } from '@/lib/utils';
import { ActivityItem, AnalyticsData, TimeSeriesData, TopPoll, GrowthMetric, EngagementMetric } from './types/dashboard-analytics';



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

import { Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};


const StatCard = ({ title, value, change, icon: Icon, trend, description }: {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-3 w-3" />;
      case 'down': return <ArrowDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'down': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
<motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{value}</div>
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit",
              getTrendColor()
            )}>
              {getTrendIcon()}
              <span className="font-medium">{change}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </CardContent>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-primary/5 pointer-events-none" />
      </Card>
    </motion.div>
  );
};

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
            view_count,
            status,
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
        const totalViews = polls?.reduce((sum, poll) => sum + (poll.view_count || 0), 0) || 0;
        const avgVotesPerPoll = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;

        // Calculate growth metrics
        const now = new Date();
        const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
        const previousPeriodStart = new Date(now);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - (daysBack * 2));
        const currentPeriodStart = new Date(now);
        currentPeriodStart.setDate(currentPeriodStart.getDate() - daysBack);

        const currentPeriodPolls = polls?.filter(poll => 
          new Date(poll.created_at) >= currentPeriodStart
        ).length || 0;

        const previousPeriodPolls = polls?.filter(poll => {
          const pollDate = new Date(poll.created_at);
          return pollDate >= previousPeriodStart && pollDate < currentPeriodStart;
        }).length || 0;

        const growthMetrics: GrowthMetric[] = [
          {
            metric: 'polls',
            current: currentPeriodPolls,
            previous: previousPeriodPolls,
            change: previousPeriodPolls > 0 ? 
              ((currentPeriodPolls - previousPeriodPolls) / previousPeriodPolls) * 100 : 0,
            trend: currentPeriodPolls > previousPeriodPolls ? 'up' : 
                   currentPeriodPolls < previousPeriodPolls ? 'down' : 'neutral'
          }
        ];

        // Generate enhanced time series data with smoother curves
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

          const combinedData = {
            date: dateStr,
            polls: pollsOnDate,
            votes: votesOnDate,
            count: pollsOnDate
          };

          timeSeriesData.push(combinedData);
          pollsOverTimeData.push({ date: dateStr, count: pollsOnDate });
          votesOverTimeData.push({ date: dateStr, count: votesOnDate });
        }

        // Enhanced top performing polls with status badges
        const topPolls: TopPoll[] = polls?.map(poll => ({
          id: poll.id,
          question: poll.question,
          votes: poll.votes?.length || 0,
          views: poll.view_count || 0,
          engagement: ((poll.votes?.length || 0) / Math.max(poll.view_count || 1, 1)) * 100,
          createdAt: poll.created_at,
          status: poll.status
        })).sort((a, b) => b.votes - a.votes).slice(0, 5) || [];

        // Enhanced recent activity with better categorization
        const recentActivity: ActivityItem[] = [];
        
        polls?.forEach(poll => {
          recentActivity.push({
            id: `poll-${poll.id}`,
            type: 'poll_created',
            description: `Created poll: "${poll.question.length > 50 ? poll.question.substring(0, 50) + '...' : poll.question}"`,
            timestamp: poll.created_at,
            pollId: poll.id,
            pollTitle: poll.question
          });

          poll.votes?.forEach(vote => {
            recentActivity.push({
              id: `vote-${vote.id}`,
              type: 'vote_received',
              description: `Received vote on "${poll.question.length > 40 ? poll.question.substring(0, 40) + '...' : poll.question}"`,
              timestamp: vote.created_at,
              pollId: poll.id,
              pollTitle: poll.question
            });
          });
        });

        recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Enhanced engagement metrics with better visualization
        const highEngagement = topPolls.filter(p => p.engagement > 10).length;
        const mediumEngagement = topPolls.filter(p => p.engagement <= 10 && p.engagement > 2).length;
        const lowEngagement = topPolls.filter(p => p.engagement <= 2).length;

        const engagementMetrics: EngagementMetric[] = [
          { name: 'High Engagement', value: highEngagement, color: '#10b981' },
          { name: 'Medium Engagement', value: mediumEngagement, color: '#f59e0b' },
          { name: 'Low Engagement', value: lowEngagement, color: '#ef4444' }
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
          engagementMetrics,
          growthMetrics
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
        <motion.div 
          className="grid md:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="animate-pulse">
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <motion.div 
        className="text-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-muted-foreground">Unable to load analytics data</p>
      </motion.div>
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
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(time.toISOString());
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: 'Live', variant: 'default' as const, icon: Activity },
      closed: { label: 'Closed', variant: 'secondary' as const, icon: Clock },
      draft: { label: 'Draft', variant: 'outline' as const, icon: TrendingDown }
    };
    
    const config = configs[status as keyof typeof configs] || configs.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <motion.div 
      className="space-y-8 bg-gradient-to-br from-background via-background to-muted/10 min-h-screen p-6 rounded-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Key Metrics */}
      <motion.div className="grid md:grid-cols-4 gap-6" variants={containerVariants}>
        <StatCard
          title="Total Polls"
          value={data.totalPolls}
          change={data.growthMetrics[0] ? `${data.growthMetrics[0].change > 0 ? '+' : ''}${data.growthMetrics[0].change.toFixed(1)}%` : undefined}
          trend={data.growthMetrics[0]?.trend}
          icon={BarChart3}
          description={data.totalPolls === 0 ? 'Create your first poll' : 'Total polls created'}
        />

        <StatCard
          title="Total Votes"
          value={data.totalVotes}
          change={data.totalVotes > 0 ? 'Across all polls' : undefined}
          icon={Users}
          description="Community engagement"
        />

        <StatCard
          title="Total Views"
          value={data.totalViews.toLocaleString()}
          change={data.totalViews > 0 ? `${((data.totalVotes / Math.max(data.totalViews, 1)) * 100).toFixed(1)}% conversion` : undefined}
          icon={Eye}
          description="Poll page impressions"
        />

        <StatCard
          title="Avg. Engagement"
          value={`${data.avgVotesPerPoll}`}
          change={data.avgVotesPerPoll > 5 ? 'High engagement' : data.avgVotesPerPoll > 2 ? 'Medium engagement' : 'Growing audience'}
          trend={data.avgVotesPerPoll > 5 ? 'up' : data.avgVotesPerPoll > 2 ? 'neutral' : 'up'}
          icon={TrendingUp}
          description="Votes per poll"
        />
      </motion.div>

      {/* Enhanced Time Range Selector */}
      <motion.div 
        className="flex items-center justify-between bg-card rounded-lg p-4 shadow-sm"
        variants={itemVariants}
      >
        <div className="space-y-1">
          <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Analytics Overview
          </h3>
          <p className="text-sm text-muted-foreground">
            Track your poll performance over time
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' },
            { key: 'all', label: 'All Time' }
          ].map((range) => (
            <Button
              key={range.key}
              variant={timeRange === range.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range.key as any)}
              className="transition-all duration-200"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6 " >
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 dark:bg-gray-800">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="polls" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Top Polls
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="overview" className="space-y-6" key="overview">
            <motion.div 
              className="grid md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Polls Created Over Time
                    </CardTitle>
                    <CardDescription>Track your poll creation momentum</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <AreaChart data={data.pollsOverTime}>
                          <defs>
                            <linearGradient id="colorPolls" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => formatDate(date).split(',')[0]}
                            fontSize={12}
                          />
                          <YAxis fontSize={12} />
                          <Tooltip 
                            labelFormatter={(date) => formatDate(date)}
                            formatter={(value) => [value, 'Polls Created']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fill="url(#colorPolls)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Card className="border-0 shadow-lg dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      Votes Received Over Time
                    </CardTitle>
                    <CardDescription>Monitor community engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={data.votesOverTime}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => formatDate(date).split(',')[0]}
                            fontSize={12}
                          />
                          <YAxis fontSize={12} />
                          <Tooltip 
                            labelFormatter={(date) => formatDate(date)}
                            formatter={(value) => [value, 'Votes']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="polls" className="space-y-6" key="polls">
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Top Performing Polls
                  </CardTitle>
                  <CardDescription>Your most successful polls by engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.topPolls.length > 0 ? (
                    <div className="space-y-4">
                      {data.topPolls.map((poll, index) => (
                        <motion.div 
                          key={poll.id} 
                          className="flex items-center justify-between p-6  rounded-xl hover:shadow-md transition-all duration-300 bg-gradient-to-r from-card to-muted/20 dark:bg-gray-800"
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg",
                              index === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30" :
                              index === 1 ? "bg-gray-100 text-gray-700 dark:bg-gray-900/30" :
                              index === 2 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30" :
                              "bg-primary/10 text-primary"
                            )}>
                              {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold line-clamp-1 text-lg">{poll.question}</h4>
                              <div className="flex items-center gap-3">
                                <p className="text-sm text-muted-foreground">
                                  Created {formatDate(poll.createdAt)}
                                </p>
                                {getStatusBadge(poll.status)}
                              </div>
                              {/* Engagement bar */}
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-2 max-w-32">
                                  <div 
                                    className="bg-primary rounded-full h-2 transition-all duration-500"
                                    style={{ width: `${Math.min(poll.engagement, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground min-w-fit">
                                  {poll.engagement.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{poll.votes}</div>
                              <div className="text-xs text-muted-foreground">Votes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-500">{poll.views}</div>
                              <div className="text-xs text-muted-foreground">Views</div>
                            </div>
                            <Link href={`/polls/${poll.id}/results`}>
                              <Button variant="outline" size="sm" className="shrink-0">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-16"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Award className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                      <h3 className="text-xl font-bold mb-3">No polls yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Create some polls to see your top performers here! Your best content will be showcased with detailed engagement metrics.
                      </p>
                      <Link href="/polls/new">
                        <Button size="lg">
                          <Zap className="h-4 w-4 mr-2" />
                          Create Your First Poll
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6" key="activity">
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest poll interactions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recentActivity.length > 0 ? (
                    <div className="space-y-3 dark:bg-gray-800">
                      {data.recentActivity.map((activity, index) => (
                        <motion.div 
                          key={activity.id} 
                          className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 border-b border-muted/20  hover:border-muted"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 4 }}
                        >
                          <div className="p-2 bg-muted/50 rounded-full">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
                          </div>
                          {activity.pollId && (
                            <Link href={`/polls/${activity.pollId}/results`}>
                              <Button variant="ghost" size="sm" className="shrink-0">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-16"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Clock className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                      <h3 className="text-xl font-bold mb-3">No recent activity</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Start creating polls and engaging with your audience to see your activity timeline here!
                      </p>
                      <Link href="/polls/new">
                        <Button size="lg">
                          <Zap className="h-4 w-4 mr-2" />
                          Create a Poll
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6" key="engagement">
            <motion.div 
              className="grid md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Card className="border-0 shadow-lg dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Engagement Distribution
                    </CardTitle>
                    <CardDescription>How your polls perform by engagement level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.engagementMetrics.some(m => m.value > 0) ? (
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={data.engagementMetrics.filter(m => m.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {data.engagementMetrics.filter(m => m.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [`${value} polls`, name]}
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Create polls to see engagement metrics</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Card className="border-0 shadow-lg dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      Growth Tips
                    </CardTitle>
                    <CardDescription>Strategies to boost your poll performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <motion.div 
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="p-2 bg-green-500/10 rounded-full">
                          <Target className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-800 dark:text-green-200">Clear & Compelling Questions</h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Make your poll questions specific, easy to understand, and engaging to your audience
                          </p>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="p-2 bg-blue-500/10 rounded-full">
                          <Share2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200">Strategic Sharing</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Share your polls on social media, forums, and with your network at peak activity times
                          </p>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="p-2 bg-purple-500/10 rounded-full">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200">Perfect Timing</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                            Post polls when your audience is most active - typically evenings and weekends
                          </p>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="p-2 bg-amber-500/10 rounded-full">
                          <TrendingUp className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200">Follow Trends</h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            Create polls about current events, trending topics, or seasonal themes for better engagement
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Quick action section */}
                    <div className="mt-6 pt-6 border-t border-muted">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Ready to grow?</h5>
                          <p className="text-xs text-muted-foreground">Start implementing these strategies</p>
                        </div>
                        <Link href="/polls/new">
                          <Button size="sm">
                            <Zap className="h-3 w-3 mr-1" />
                            Create Poll
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}