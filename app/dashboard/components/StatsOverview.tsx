"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  Eye, 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  CheckCircle,
  Edit3,
  PauseCircle
} from "lucide-react";
import { type Poll } from "@/app/types/database";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  polls: Poll[];
  totalVotes: number;
  totalViews: number;
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: string;
  bgColor: string;
  delay: number;
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  trendValue,
  color,
  bgColor,
  delay 
}: StatCardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className="h-full"
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-muted/30 h-full dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn("p-2 rounded-lg", bgColor)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <motion.div 
              className="text-3xl font-bold text-foreground"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: delay + 0.2,
                type: "spring",
                stiffness: 200 
              }}
            >
              {value.toLocaleString()}
            </motion.div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
          
          {trend && trendValue && (
            <motion.div 
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.4 }}
            >
              <TrendIcon className={cn(
                "h-3 w-3",
                trend === 'up' && "text-green-500",
                trend === 'down' && "text-red-500",
                trend === 'neutral' && "text-gray-500"
              )} />
              <span className={cn(
                "text-xs font-medium",
                trend === 'up' && "text-green-600 dark:text-green-400",
                trend === 'down' && "text-red-600 dark:text-red-400",
                trend === 'neutral' && "text-gray-600 dark:text-gray-400"
              )}>
                {trendValue}
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function StatsOverview({ polls, totalVotes, totalViews }: StatsOverviewProps) {
  const activePolls = polls.filter(p => p.status === 'active').length;
  const draftPolls = polls.filter(p => p.status === 'draft').length;
  const closedPolls = polls.filter(p => p.status === 'closed').length;
  const totalPolls = polls.length;
  
  // Calculate engagement metrics
  const averageVotesPerPoll = totalPolls > 0 ? (totalVotes / totalPolls) : 0;
  const averageViewsPerPoll = totalPolls > 0 ? (totalViews / totalPolls) : 0;
  const engagementRate = totalViews > 0 ? ((totalVotes / totalViews) * 100) : 0;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const stats = [
    {
      title: "Active Polls",
      value: activePolls,
      description: "Currently live and collecting votes",
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      trend: activePolls > 0 ? 'up' as const : 'neutral' as const,
      trendValue: activePolls > 0 ? `${((activePolls / totalPolls) * 100).toFixed(0)}% of total` : "No active polls",
      delay: 0
    },
    {
      title: "Total Polls",
      value: totalPolls,
      description: "All polls you have created",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      trend: totalPolls > 5 ? 'up' as const : totalPolls > 0 ? 'neutral' as const : 'down' as const,
      trendValue: totalPolls > 0 ? `${draftPolls} drafts, ${closedPolls} closed` : "Create your first poll",
      delay: 0.1
    },
    {
      title: "Total Votes",
      value: totalVotes,
      description: "Across all your polls",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      trend: totalVotes > 50 ? 'up' as const : totalVotes > 0 ? 'neutral' as const : 'down' as const,
      trendValue: totalVotes > 0 ? `${averageVotesPerPoll.toFixed(1)} avg per poll` : "No votes yet",
      delay: 0.2
    },
    {
      title: "Total Views",
      value: totalViews,
      description: "Total poll impressions",
      icon: Eye,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      trend: totalViews > 100 ? 'up' as const : totalViews > 0 ? 'neutral' as const : 'down' as const,
      trendValue: totalViews > 0 ? `${averageViewsPerPoll.toFixed(1)} avg per poll` : "No views yet",
      delay: 0.3
    }
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Additional Insights */}
      {totalPolls > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Engagement Rate */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-card to-muted/20 dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Engagement Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {engagementRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Votes per view ratio
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(engagementRate, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Poll Status Breakdown */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-card to-muted/20 dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  Poll Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                    <span className="text-sm font-semibold">{activePolls}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-3 w-3 text-amber-500" />
                      <span className="text-xs text-muted-foreground">Drafts</span>
                    </div>
                    <span className="text-sm font-semibold">{draftPolls}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PauseCircle className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-muted-foreground">Closed</span>
                    </div>
                    <span className="text-sm font-semibold">{closedPolls}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-card to-muted/20 dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {totalVotes > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-foreground">
                        {averageVotesPerPoll.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average votes per poll
                      </p>
                      {engagementRate > 10 && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          <span className="text-xs font-medium">High engagement</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-muted-foreground">
                        Ready to start?
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Create your first poll to see insights
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {totalPolls === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mx-auto mb-4 relative">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Start tracking your polls</h3>
              <p className="text-muted-foreground mb-4">
                Create your first poll to see detailed analytics and engagement metrics
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}