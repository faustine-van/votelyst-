"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  BarChart3, 
  Users, 
  Calendar, 
  Activity, 
  Lock, 
  Unlock, 
  CheckCircle, 
  Edit3 
} from "lucide-react";
import { PollWithOptions } from "@/app/types/database";
import { formatDate } from "@/app/utils/date";
import { cn } from "@/lib/utils";

interface PollsListProps {
  polls: PollWithOptions[];
  user: any;
}

// Status config function
const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return { label: "Live", variant: "default" as const, color: "bg-emerald-500", icon: Activity, textColor: "text-emerald-600" };
    case "closed":
      return { label: "Closed", variant: "secondary" as const, color: "bg-red-500", icon: CheckCircle, textColor: "text-red-600" };
    default:
      return { label: "Draft", variant: "outline" as const, color: "bg-amber-500", icon: Edit3, textColor: "text-amber-600" };
  }
};

// Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const cardHoverVariants: Variants = {
  rest: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
  hover: { scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", transition: { type: "spring", stiffness: 400, damping: 25 } },
};

export function PollsList({ polls, user }: PollsListProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Your Polls
            </h2>
            <p className="text-muted-foreground text-lg">
              Browse and manage your {polls.length} poll{polls.length !== 1 ? 's' : ''}
            </p>

            {polls.length > 0 && (
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <span>{polls.filter(p => p.status === 'active').length} active</span>
                </div>
                <div className="flex items-center gap-1">
                  <Edit3 className="h-4 w-4 text-amber-500" />
                  <span>{polls.filter(p => p.status === 'draft').length} drafts</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-red-500" />
                  <span>{polls.filter(p => p.status === 'closed').length} closed</span>
                </div>
              </div>
            )}
          </div>

          <Link href="/polls/new">
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create New Poll
            </Button>
          </Link>
        </motion.div>

        {polls && polls.length > 0 ? (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {polls.map((poll: PollWithOptions) => {
              const statusConfig = getStatusConfig(poll.status);
              const StatusIcon = statusConfig.icon;
              const voteCount = poll.votes?.length ?? 0;
              const optionCount = poll.options?.length ?? 0;

              return (
                <motion.div 
                  key={poll.id} 
                  variants={itemVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <Link href={`/polls/${poll.id}`}>
                    <motion.div variants={cardHoverVariants}>
                      <Card className="cursor-pointer border-0 bg-gradient-to-br from-card to-muted/30 backdrop-blur-sm h-full flex flex-col dark:bg-gray-800">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={cn("text-white font-medium px-2 py-1 flex items-center gap-1", statusConfig.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>

                            <Badge variant={poll.requires_login ? "destructive" : "outline"} className="flex items-center gap-1">
                              {poll.requires_login ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                              {poll.requires_login ? "Private" : "Public"}
                            </Badge>
                          </div>

                          <CardTitle className="text-lg line-clamp-2 leading-tight hover:text-primary transition-colors duration-200">
                            {poll.question}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col justify-between">
                          {poll.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                              {poll.description}
                            </p>
                          )}

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="p-1 bg-primary/10 rounded">
                                  <BarChart3 className="h-3 w-3 text-primary" />
                                </div>
                                <span className="font-medium">{optionCount}</span>
                                <span className="text-muted-foreground text-xs">options</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <div className="p-1 bg-blue-500/10 rounded">
                                  <Users className="h-3 w-3 text-blue-500" />
                                </div>
                                <span className="font-medium">{voteCount}</span>
                                <span className="text-muted-foreground text-xs">votes</span>
                              </div>
                            </div>

                            {voteCount > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Engagement</span>
                                  <span className={cn("font-medium", voteCount >= 20 ? "text-green-500" : voteCount >= 10 ? "text-yellow-500" : "text-blue-500")}>
                                    {voteCount >= 20 ? 'High' : voteCount >= 10 ? 'Medium' : 'Low'}
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5">
                                  <div className={cn("h-1.5 rounded-full transition-all duration-500", voteCount >= 20 ? "bg-green-500" : voteCount >= 10 ? "bg-yellow-500" : "bg-blue-500")}
                                    style={{ width: `${Math.min((voteCount / 30) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-muted/50">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(poll.created_at)}</span>
                              </div>

                              {poll.status === 'active' && (
                                <div className="flex items-center gap-1 text-emerald-600">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                  <span className="font-medium">Live</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="max-w-md mx-auto border-dashed border-2 border-muted-foreground/20 bg-muted/10">
              <CardContent className="pt-8 pb-8">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.3 }}>
                  <div className="relative mx-auto mb-6">
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <BarChart3 className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                      <PlusCircle className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">Ready to create your first poll?</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Start engaging with your audience by creating interactive polls. 
                    Share opinions, gather feedback, or just have fun!
                  </p>
                  
                  <Link href="/polls/new">
                    <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200">
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Create Your First Poll
                    </Button>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
