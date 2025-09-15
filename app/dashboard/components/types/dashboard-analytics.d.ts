export interface AnalyticsData {
  totalPolls: number;
  totalVotes: number;
  totalViews: number;
  avgVotesPerPoll: number;
  recentActivity: ActivityItem[];
  pollsOverTime: TimeSeriesData[];
  votesOverTime: TimeSeriesData[];
  topPolls: TopPoll[];
  engagementMetrics: EngagementMetric[];
  growthMetrics: GrowthMetric[];
}

export interface ActivityItem {
  id: string;
  type: 'poll_created' | 'vote_received' | 'poll_shared';
  description: string;
  timestamp: string;
  pollId?: string;
  pollTitle?: string;
}

export interface TimeSeriesData {
  date: string;
  count: number;
  polls?: number;
  votes?: number;
}

export interface TopPoll {
  id: string;
  question: string;
  votes: number;
  views: number;
  engagement: number;
  createdAt: string;
  status: string;
}

export interface EngagementMetric {
  name: string;
  value: number;
  color: string;
}

export interface GrowthMetric {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}