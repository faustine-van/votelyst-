"use client";

import { motion, Variants } from "framer-motion";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { type PollWithResults } from '@/app/types/database';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Lock, 
  BarChart3, 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Calendar,
  Trophy,
  Target,
  Activity,
  Share2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/app/utils/date';
import { SharePollDialog } from '@/components/share-poll-dialog';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-primary">
          Votes: <span className="font-semibold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function PollResultsChart({ poll }: { poll: PollWithResults }) {
  const { user, loading } = useAuth();

  const data = poll.results.map((result, index) => ({
    name: result.option_text,
    votes: result.vote_count,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const totalVotes = data.reduce((sum, item) => sum + item.votes, 0);
  const maxVotes = Math.max(...data.map(item => item.votes));
  const winningOption = data.find(item => item.votes === maxVotes);

  // Check if user has permission to view results
  const hasPermission = !poll.user_id || (user && poll.user_id === user.id);

  const exportData = () => {
    const csvContent = [
      ['Option', 'Votes', 'Percentage'],
      ...data.map(item => [
        item.name,
        item.votes,
        `${totalVotes > 0 ? ((item.votes / totalVotes) * 100).toFixed(1) : 0}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poll-results-${poll.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border-t-2 border-primary/30 mx-auto animate-pulse"></div>
          </div>
          <p className="text-muted-foreground">Loading results...</p>
        </motion.div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Enhanced Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="hover:bg-muted/50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Poll Results</h1>
                </div>
              </div>
              {!user && (
                <div className="flex items-center gap-4">
                  <Link href="/auth/login">
                    <Button>Sign In</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="container py-24">
          <motion.div 
            className="text-center max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10">
              <CardContent className="pt-12 pb-12">
                <div className="relative mx-auto mb-8">
                  <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="h-10 w-10 text-red-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-3">Access Restricted</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  You can only view results for polls you created. Sign in to view your poll results and manage your polls.
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Link href="/auth/login">
                    <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" size="lg">Go Home</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={user ? "/dashboard" : "/"}>
                <Button variant="ghost" size="sm" className="hover:bg-muted/50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {user ? "Back to Dashboard" : "Back to Home"}
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Poll Results</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <SharePollDialog
                pollId={poll.id}
                pollQuestion={poll.question}
                pollDescription={poll.description || ""}
              >
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </SharePollDialog>
              
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Poll Header with Stats */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 bg-gradient-to-r from-card to-muted/30 shadow-xl dark:bg-gray-800">
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <h1 className="text-3xl font-bold leading-tight">{poll.question}</h1>
                      {poll.description && (
                        <p className="text-muted-foreground text-lg leading-relaxed">{poll.description}</p>
                      )}
                      
                      {/* Enhanced metadata */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-primary/10 rounded">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-semibold text-primary">{totalVotes}</span>
                          <span className="text-muted-foreground">total votes</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Target className="h-4 w-4" />
                          <span>{poll.poll_type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatDate(poll.created_at)}</span>
                        </div>
                        
                        {poll.user_id && user && poll.user_id === user.id && (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600">
                            <Trophy className="h-3 w-3 mr-1" />
                            Your Poll
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Winner Highlight */}
            {totalVotes > 0 && winningOption && (
              <motion.div variants={itemVariants}>
                <Card className="border-2 border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 ">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 rounded-full">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                          Leading Option: "{winningOption.name}"
                        </p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500">
                          {winningOption.votes} votes ({((winningOption.votes / totalVotes) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enhanced Chart */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-muted/20 dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="h-5 w-5" />
                    Vote Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ width: '100%', height: 450 }}>
                    <ResponsiveContainer>
                      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Results Table */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-xl dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Activity className="h-5 w-5" />
                    Detailed Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {data
                      .sort((a, b) => b.votes - a.votes)
                      .map((result, index) => {
                        const percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0;
                        const isWinner = result.votes === maxVotes && totalVotes > 0;
                        
                        return (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                              "grid grid-cols-12 items-center gap-4 p-4 rounded-lg transition-all duration-200 border",
                              isWinner && "bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800"
                            )}
                          >
                            {/* Rank */}
                            <div className="col-span-1 flex items-center justify-center">
                              {isWinner ? (
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <Trophy className="h-4 w-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                              )}
                            </div>
                            
                            {/* Option name */}
                            <div className="col-span-4">
                              <span 
                                className={cn(
                                  "font-medium break-words",
                                  isWinner && "text-emerald-700 dark:text-emerald-400"
                                )} 
                                title={result.name}
                              >
                                {result.name}
                              </span>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="col-span-5">
                              <div className="space-y-1">
                                <Progress 
                                  value={percentage} 
                                  className="h-3"
                                  style={{
                                    '--progress-background': result.color,
                                  } as React.CSSProperties}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{result.votes} votes</span>
                                  <span>{percentage.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Percentage */}
                            <div className="col-span-2 text-right">
                              <div className={cn(
                                "text-lg font-bold",
                                isWinner && "text-emerald-600 dark:text-emerald-400"
                              )}>
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>

                  {/* Summary Statistics */}
                  {totalVotes > 0 && (
                    <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{totalVotes}</div>
                          <div className="text-sm text-muted-foreground">Total Votes</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">{data.length}</div>
                          <div className="text-sm text-muted-foreground">Options</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {((maxVotes / totalVotes) * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Winning Margin</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}