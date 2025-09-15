"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart3,
  ArrowLeft,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  Share2,
  Lock,
  Unlock,
  Vote,
  TrendingUp,
  Clock,
  Target,
  Activity,
  Zap,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAnonId } from "@/lib/utils";
import { SharePollDialog } from "@/components/share-poll-dialog";
import { formatDate } from "@/app/utils/date";
import { incrementPollViewCount } from "@/app/(main)/polls/[id]/actions";
import { cn } from "@/lib/utils";

interface PollOption {
  id: string;
  option_text: string;
  poll_id: string;
}

interface Poll {
  id: string;
  question: string;
  description?: string;
  created_at: string;
  user_id: string;
  options: PollOption[];
  requires_login: boolean;
  poll_type: "single_choice" | "multiple_choice";
}

interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string | null;
  anon_id?: string | null;
  created_at: string;
}

interface PollVotingPageProps {
  pollId: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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

const pulseVariants = {
  rest: { scale: 1 },
  pulse: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: "tween", duration: 0.6, ease: "easeInOut" },
      opacity: { duration: 0.2 },
    },
  },
};

export function PollVotingPage({ pollId }: PollVotingPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (pollId) {
      incrementPollViewCount(pollId);
    }
  }, [pollId]);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const supabase = await createSupabaseClient();

        const { data: pollData, error: pollError } = await supabase
          .from("polls")
          .select(
            `
            id,
            question,
            description,
            created_at,
            user_id,
            requires_login,
            poll_type,
            options:poll_options (
              id,
              option_text,
              poll_id
            )
          `
          )
          .eq("id", pollId)
          .single();

        // Add this line to check what is returned
        console.log("Fetched Poll Data:", pollData);

        if (pollError) {
          console.error("Error fetching poll:", pollError);
          if (pollError.code === "PGRST116") {
            setError("Poll not found");
          } else {
            setError(`Error loading poll: ${pollError.message}`);
          }
          return;
        }

        if (!pollData) {
          setError("Poll not found");
          return;
        }

        if (pollData.requires_login && !user && !authLoading) {
          router.push(`/login?redirectedFrom=/polls/${pollId}`);
          return;
        }

        setPoll(pollData);

        // Check for existing vote
        let voteQuery = supabase
          .from("votes")
          .select("*")
          .eq("poll_id", pollId);
        if (user?.id) {
          voteQuery = voteQuery.eq("user_id", user.id);
        } else if (!pollData.requires_login) {
          const anonId = getAnonId();
          if (anonId) {
            voteQuery = voteQuery.eq("anon_id", anonId);
          } else {
            return;
          }
        } else {
          return;
        }

        const { data: voteData, error: voteError } = await voteQuery;

        if (voteError) {
          console.error("Error checking vote:", voteError);
        } else if (voteData) {
          setUserVotes(voteData);
          setSelectedOptions(voteData.map((v) => v.option_id));
        }
      } catch (error) {
        console.error("Unexpected error fetching poll:", error);
        setError("An unexpected error occurred while loading the poll");
      } finally {
        setLoading(false);
      }
    };

    if (pollId && !authLoading) {
      fetchPoll();
    } else if (!pollId) {
      setError("No poll ID provided");
      setLoading(false);
    }
  }, [pollId, user?.id, authLoading, router]);

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      toast.error("Please select an option");
      return;
    }

    if (userVotes.length > 0) {
      toast.error("You have already voted on this poll");
      return;
    }

    if (poll?.requires_login && !user) {
      router.push(`/login?redirectedFrom=/polls/${pollId}`);
      return;
    }

    setVoting(true);
    try {
      const supabase = createSupabaseClient();

      const votePayloads = selectedOptions.map((option_id) => {
        const payload: {
          poll_id: string;
          option_id: string;
          user_id?: string;
          anon_id?: string;
        } = {
          poll_id: pollId,
          option_id,
        };
        if (user) {
          payload.user_id = user.id;
        } else if (!poll?.requires_login) {
          payload.anon_id = getAnonId();
        }
        return payload;
      });

      if (votePayloads.some((p) => !p.user_id && !p.anon_id)) {
        toast.error("You must be logged in to vote on this poll.");
        setVoting(false);
        return;
      }

      const { data, error } = await supabase
        .from("votes")
        .insert(votePayloads)
        .select();

      if (error) {
        console.error("Voting error:", error);

        if (error.code === "23505") {
          toast.error("You have already voted on this poll");
          let voteCheckQuery = supabase
            .from("votes")
            .select()
            .eq("poll_id", pollId);
          if (user) {
            voteCheckQuery = voteCheckQuery.eq("user_id", user.id);
          } else {
            voteCheckQuery = voteCheckQuery.eq("anon_id", getAnonId());
          }
          const { data: existingVotes } = await voteCheckQuery;
          if (existingVotes) setUserVotes(existingVotes);
        } else {
          toast.error(`Failed to submit vote: ${error.message}`);
        }
      } else if (data) {
        setUserVotes(data);
        setShowSuccess(true);
        toast.success("Vote submitted successfully!");

        setTimeout(() => {
          router.push(`/polls/${pollId}/results`);
        }, 2000);
      }
    } catch (error) {
      console.error("Unexpected error submitting vote:", error);
      toast.error("An unexpected error occurred while voting");
    } finally {
      setVoting(false);
    }
  };

  const handleOptionToggle = (optionId: string) => {
    if (poll?.poll_type === "single_choice") {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-t-2 border-primary/30 mx-auto animate-pulse"></div>
            <div className="absolute inset-4 rounded-full bg-primary/10 animate-pulse"></div>
          </div>
          <p className="text-muted-foreground text-lg">Loading poll...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Poll</h1>
                </div>
              </div>
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
                    <AlertCircle className="h-10 w-10 text-red-500" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-3">
                  {error.includes("not found")
                    ? "Poll Not Found"
                    : "Error Loading Poll"}
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {error}
                </p>

                <div className="flex gap-4 justify-center flex-wrap">
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                  <Link href="/">
                    <Button variant="outline">Go Home</Button>
                  </Link>
                  {user && (
                    <Link href="/polls">
                      <Button variant="outline">My Polls</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const isOwnPoll = user && poll.user_id === user.id;
  const hasVoted = userVotes.length > 0;
  const canVote = !poll.requires_login || !!user;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
    >
      {/* Enhanced Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={user ? "/polls" : "/"}>
                <Button variant="ghost" size="sm" className="hover:bg-muted/50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {user ? "Back to My Polls" : "Back to Home"}
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Vote className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Vote on Poll
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  {/* <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {user.email?.split("@")[0]}
                  </span> */}
                </div>
              ) : (
                <Link href={`/login?redirectedFrom=/polls/${pollId}`}>
                  <Button variant="outline">Sign In</Button>
                </Link>
              )}

              <SharePollDialog
                pollId={poll.id}
                pollQuestion={poll.question}
                pollDescription={poll.description}
              >
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </SharePollDialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Poll Header */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 bg-gradient-to-r from-card to-muted/30 shadow-xl dark:bg-gray-800">
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-4 flex-1">
                      <h1 className="text-4xl font-bold text-foreground leading-tight">
                        {poll.question}
                      </h1>
                      {poll.description && (
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          {poll.description}
                        </p>
                      )}

                      {/* Enhanced metadata */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-primary/10 rounded">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-muted-foreground">
                            Created {formatDate(poll.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-blue-500/10 rounded">
                            <Target className="h-4 w-4 text-blue-500" />
                          </div>
                          <span className="text-muted-foreground">
                            {poll.options.length} options
                          </span>
                        </div>

                        <Badge
                          className={cn(
                            "flex items-center gap-1",
                            poll.requires_login
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-emerald-500 hover:bg-emerald-600"
                          )}
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

                    {isOwnPoll && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 shrink-0">
                        <Heart className="h-3 w-3 mr-1" />
                        Your Poll
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Success Animation */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
                >
                  <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 shadow-2xl">
                    <CardContent className="pt-8 pb-8 text-center">
                      <div className="relative mx-auto mb-4">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                          <motion.svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <motion.path
                              d="M20 6L9 17l-5-5"
                              variants={checkmarkVariants}
                              initial="hidden"
                              animate="visible"
                            />
                          </motion.svg>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                        Vote Submitted!
                      </h3>
                      <p className="text-emerald-600 dark:text-emerald-500">
                        Redirecting to results...
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voting Status Messages */}
            <AnimatePresence>
              {hasVoted && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-full">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Vote Successfully Recorded
                          </p>
                          <p className="text-sm text-emerald-600 dark:text-emerald-500">
                            Your voice has been heard! View results or share
                            this poll with others.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {poll.requires_login && !user && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-full">
                          <Lock className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-700 dark:text-blue-400">
                            Authentication Required
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-500 mb-3">
                            This is a private poll. Sign in to participate and
                            make your voice heard.
                          </p>
                          <Link href={`/login?redirectedFrom=/polls/${pollId}`}>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Sign In to Vote
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voting Form */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-xl dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Vote className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Cast Your Vote</CardTitle>
                      <CardDescription className="text-base">
                        {hasVoted
                          ? "Your current selection is highlighted below"
                          : canVote
                          ? `Select ${
                              poll.poll_type === "multiple_choice"
                                ? "one or more options"
                                : "an option"
                            } and submit your vote`
                          : "Sign in to participate in this poll"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3 ">
                    {poll.poll_type === "single_choice" ? (
                      <RadioGroup
                        value={selectedOptions[0]}
                        onValueChange={handleOptionToggle}
                        disabled={!canVote || hasVoted}
                      >
                        {poll?.options?.map((option, index) => {
                          const isSelected = selectedOptions.includes(
                            option.id
                          );
                          const isUserVote =
                            hasVoted &&
                            userVotes.some((v) => v.option_id === option.id);

                          return (
                            <motion.div
                              key={option.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              variants={pulseVariants}
                              // animate={isSelected && !hasVoted ? "pulse" : "rest"}
                              className={cn(
                                "group relative p-4 rounded-xl border-2 transition-all duration-300",
                                isUserVote
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shadow-lg"
                                  : isSelected
                                  ? "border-primary bg-primary/5 shadow-md"
                                  : "border-border hover:border-primary/50 hover:bg-muted/30",
                                !canVote || hasVoted
                                  ? "cursor-not-allowed opacity-70"
                                  : "cursor-pointer hover:shadow-lg"
                              )}
                            >
                              <div className="flex items-center space-x-4">
                                <RadioGroupItem
                                  value={option.id}
                                  id={option.id}
                                  className="scale-125"
                                />

                                <Label
                                  htmlFor={option.id}
                                  className={cn(
                                    "flex-1 cursor-pointer text-lg font-medium leading-relaxed",
                                    isUserVote &&
                                      "text-emerald-700 dark:text-emerald-400",
                                    isSelected && !isUserVote && "text-primary"
                                  )}
                                >
                                  {option.option_text}
                                  {isUserVote && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="ml-3 inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900 px-2 py-1 rounded-full"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      Your Vote
                                    </motion.span>
                                  )}
                                </Label>

                                {isSelected && !hasVoted && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="text-primary"
                                  >
                                    <Zap className="h-5 w-5" />
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </RadioGroup>
                    ) : (
                      poll?.options?.map((option, index) => {
                        const isSelected = selectedOptions.includes(option.id);
                        const isUserVote =
                          hasVoted &&
                          userVotes.some((v) => v.option_id === option.id);

                        return (
                          <motion.div
                            key={option.id}
                            initial={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.1 }}
                            variants={pulseVariants}
                            animate={isSelected && !hasVoted ? "pulse" : "rest"}
                            className={cn(
                              "group relative p-4 rounded-xl border-2 transition-all duration-300",
                              isUserVote
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shadow-lg"
                                : isSelected
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border hover:border-primary/50 hover:bg-muted/30",
                              !canVote || hasVoted
                                ? "cursor-not-allowed opacity-70"
                                : "cursor-pointer hover:shadow-lg"
                            )}
                            onClick={() => {
                              if (canVote && !hasVoted) {
                                handleOptionToggle(option.id);
                              }
                            }}
                          >
                            <div className="flex items-center space-x-4">
                              <Checkbox
                                checked={isSelected}
                                disabled={!canVote || hasVoted}
                                className="scale-125"
                              />

                              <Label
                                htmlFor={option.id}
                                className={cn(
                                  "flex-1 cursor-pointer text-lg font-medium leading-relaxed",
                                  isUserVote &&
                                    "text-emerald-700 dark:text-emerald-400",
                                  isSelected && !isUserVote && "text-primary"
                                )}
                              >
                                {option.option_text}
                                {isUserVote && (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="ml-3 inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900 px-2 py-1 rounded-full"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    Your Vote
                                  </motion.span>
                                )}
                              </Label>

                              {isSelected && !hasVoted && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  className="text-primary"
                                >
                                  <Zap className="h-5 w-5" />
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {canVote && !hasVoted && (
                    <motion.div
                      className="pt-6"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleVote}
                        disabled={selectedOptions.length === 0 || voting}
                        className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        {voting ? (
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Submitting Vote...
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Vote className="h-5 w-5" />
                            Submit Vote
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              →
                            </motion.div>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants}>
              <div className="flex gap-4 justify-center flex-wrap ">
                {(hasVoted || isOwnPoll) && (
                  <Link href={`/polls/${pollId}/results`}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="shadow-md hover:shadow-lg"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </Link>
                )}

                {isOwnPoll && (
                  <Link href={`/polls/${pollId}/edit`}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="shadow-md hover:shadow-lg"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Edit Poll
                    </Button>
                  </Link>
                )}

                <SharePollDialog
                  pollId={poll.id}
                  pollQuestion={poll.question}
                  pollDescription={poll.description}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="shadow-md hover:shadow-lg"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Poll
                  </Button>
                </SharePollDialog>
              </div>
            </motion.div>

            {/* Poll Info Footer */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-r from-muted/30 to-muted/10 border-0 dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center justify-center gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Poll Type:{" "}
                          {poll.poll_type === "multiple_choice"
                            ? "Multiple Choice"
                            : "Single Choice"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {formatDate(poll.created_at)}</span>
                      </div>

                      {isOwnPoll && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <Heart className="h-4 w-4" />
                          <span>This is your poll</span>
                        </div>
                      )}
                    </div>

                    {!user && (
                      <div className="pt-3 border-t border-muted/50">
                        <p>
                          <Link
                            href="/register"
                            className="text-primary hover:underline font-medium"
                          >
                            Create a free account
                          </Link>{" "}
                          to start creating your own interactive polls and
                          engage with your audience
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
