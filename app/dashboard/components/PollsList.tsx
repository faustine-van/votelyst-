"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SharePollDialog } from "@/components/share-poll-dialog";
import { cn } from "@/lib/utils";
import { 
  Eye, 
  Share2, 
  MoreHorizontal, 
  Plus, 
  Users, 
  BarChart3, 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  Lock, 
  Unlock,
  Calendar,
  TrendingUp,
  Activity
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { type Poll } from "@/app/types/database";
import { LoadingDisplay } from "@/app/(main)/polls/components/LoadingDisplay";
import { formatDate } from "@/app/utils/date";

interface PollsListProps {
  polls: Poll[];
  updatingPollId: string | null;
  handleStatusCycle: (pollId: string, currentStatus: "draft" | "active" | "closed") => void;
  handlePrivacyChange: (pollId: string, requires_login: boolean) => void;
  handleDelete: (pollId: string) => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return {
        label: "Live",
        color: "bg-emerald-500 hover:bg-emerald-600",
        icon: Activity,
        textColor: "text-emerald-600"
      };
    case "closed":
      return {
        label: "Closed",
        color: "bg-red-500 hover:bg-red-600",
        icon: Pause,
        textColor: "text-red-600"
      };
    default:
      return {
        label: "Draft",
        color: "bg-amber-500 hover:bg-amber-600",
        icon: Edit3,
        textColor: "text-amber-600"
      };
  }
};

export function PollsList({ polls, updatingPollId, handleStatusCycle, handlePrivacyChange, handleDelete }: PollsListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
  };

  const cardHoverVariants = {
    rest: { 
      scale: 1,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    hover: { 
      scale: 1.02,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with improved styling */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-foreground">
            Your Polls
          </h3>
          <p className="text-sm text-muted-foreground">
            {polls.length} poll{polls.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <Link href="/polls/new">
          <Button className="shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            New Poll
          </Button>
        </Link>
      </div>

      {polls.length > 0 ? (
        <motion.div
          className="grid gap-6"
          variants={containerVariants}
        >
          {polls.map((poll) => {
            const statusConfig = getStatusConfig(poll.status);
            const StatusIcon = statusConfig.icon;
            const voteCount = poll.votes ? poll.votes.length : 0;
            
            return (
              <motion.div 
                key={poll.id} 
                variants={itemVariants}
                whileHover="hover"
                initial="rest"
              >
                <motion.div variants={cardHoverVariants}>
                  <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-background to-muted/20 dark:bg-gray-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left side: Poll Question + Description */}
                        <div className="space-y-2 flex-1 min-w-0">
                          {/* Question with better typography */}
                          <CardTitle className="text-xl font-bold break-words leading-tight hover:text-primary transition-colors duration-200">
                            <Link href={`/polls/${poll.id}`} className="hover:underline">
                              {poll.question}
                            </Link>
                          </CardTitle>

                          {/* Description with improved styling */}
                          {poll.description && (
                            <CardDescription className="text-muted-foreground break-words whitespace-pre-line leading-relaxed line-clamp-2">
                              {poll.description}
                            </CardDescription>
                          )}

                          {/* Status badges with icons */}
                          <div className="flex items-center gap-3 mt-3">
                            <Badge 
                              className={cn(
                                "text-white font-medium px-3 py-1 flex items-center gap-1.5",
                                statusConfig.color
                              )}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusConfig.label}
                            </Badge>
                            
                            <Badge 
                              variant="secondary"
                              className="flex items-center gap-1.5"
                            >
                              {poll.requires_login ? (
                                <Lock className="h-3 w-3" />
                              ) : (
                                <Unlock className="h-3 w-3" />
                              )}
                              {poll.requires_login ? "Private" : "Public"}
                            </Badge>
                          </div>
                        </div>

                        {/* Right side: More Options */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updatingPollId === poll.id}
                              className="shrink-0 hover:bg-muted/50"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {/* Status actions */}
                            <DropdownMenuItem
                              onClick={() => handleStatusCycle(poll.id, poll.status)}
                              className="flex items-center gap-2"
                            >
                              {poll.status === "active" ? (
                                <>
                                  <Pause className="h-4 w-4" />
                                  Close Poll
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4" />
                                  Set as Active
                                </>
                              )}
                            </DropdownMenuItem>

                            {/* Privacy toggle */}
                            <DropdownMenuItem
                              onClick={() => handlePrivacyChange(poll.id, !poll.requires_login)}
                              className="flex items-center gap-2"
                            >
                              {poll.requires_login ? (
                                <>
                                  <Unlock className="h-4 w-4" />
                                  Make Public
                                </>
                              ) : (
                                <>
                                  <Lock className="h-4 w-4" />
                                  Make Private
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* View actions */}
                            <DropdownMenuItem asChild>
                              <Link href={`/polls/${poll.id}/results`} className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                View Results
                              </Link>
                            </DropdownMenuItem>

                            <SharePollDialog
                              pollId={poll.id}
                              pollQuestion={poll.question}
                              pollDescription={poll.description || ""}
                            >
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="flex items-center gap-2"
                              >
                                <Share2 className="h-4 w-4" />
                                Share Poll
                              </DropdownMenuItem>
                            </SharePollDialog>

                            <DropdownMenuSeparator />

                            {/* Edit action */}
                            <DropdownMenuItem asChild>
                              <Link href={`/polls/${poll.id}/edit`} className="flex items-center gap-2">
                                <Edit3 className="h-4 w-4" />
                                Edit Poll
                              </Link>
                            </DropdownMenuItem>

                            {/* Delete action */}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                if (
                                  confirm(
                                    "Are you sure you want to delete this poll? This action cannot be undone."
                                  )
                                ) {
                                  handleDelete(poll.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-2"
                              disabled={updatingPollId === poll.id}
                            >
                              <Trash2 className="h-4 w-4" />
                              {updatingPollId === poll.id ? "Deleting..." : "Delete Poll"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm">
                        {/* Bottom Left: Created Date with icon */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatDate(poll.created_at)}</span>
                        </div>

                        {/* Bottom Right: Enhanced vote display */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span className="font-medium">{poll.view_count || 0}</span>
                            <span className="text-xs">views</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-primary">{voteCount}</span>
                            <span className="text-xs text-muted-foreground">
                              vote{voteCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress indicator for votes */}
                      {voteCount > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Engagement</span>
                            <span>{voteCount >= 10 ? 'High' : voteCount >= 5 ? 'Medium' : 'Low'}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div 
                              className={cn(
                                "h-1.5 rounded-full transition-all duration-500",
                                voteCount >= 10 ? "bg-green-500" : 
                                voteCount >= 5 ? "bg-yellow-500" : "bg-blue-500"
                              )}
                              style={{ 
                                width: `${Math.min((voteCount / 20) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/20">
            <CardContent className="text-center py-16">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mx-auto mb-6 relative">
                  <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                    <Plus className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">
                  Ready to create your first poll?
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Start engaging with your audience by creating interactive polls. 
                  It only takes a minute to set up!
                </p>
                
                <Link href="/polls/new">
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Poll
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}