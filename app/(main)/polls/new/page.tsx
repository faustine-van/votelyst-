"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  X,
  AlertCircle,
  Lock,
  ArrowLeft,
  BarChart3,
  Plus,
  Trash2,
  Eye,
  Users,
  Sparkles,
  Check,
  Settings,
  Lightbulb,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createPoll } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { calculatePollProgress } from "./utils/progress";
import { Progress } from "@/components/ui/progress";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
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
      damping: 15,
    },
  },
};

const optionVariants: Variants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

export default function NewPollPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"draft" | "active" | "closed">("active");
  const [pollType, setPollType] = useState<"single_choice" | "multiple_choice">(
    "single_choice"
  );
  const [currentStep, setCurrentStep] = useState(1);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    } else {
      toast.error("Maximum 10 options allowed");
    }
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { color: "bg-emerald-500", label: "Live", icon: Eye };
      case "draft":
        return { color: "bg-amber-500", label: "Draft", icon: Settings };
      case "closed":
        return { color: "bg-red-500", label: "Closed", icon: Lock };
      default:
        return { color: "bg-gray-500", label: "Unknown", icon: Settings };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim() === "") {
      toast.error("Poll title cannot be empty.");
      return;
    }

    const filteredOptions = options.filter((option) => option.trim() !== "");
    if (filteredOptions.length < 2) {
      toast.error("Please provide at least two options.");
      return;
    }

    if (new Set(filteredOptions).size !== filteredOptions.length) {
      toast.error("Poll options must be unique.");
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        if (requiresLogin) {
          toast.error("You must be logged in to create a private poll.");
          setLoading(false);
          return;
        }
        await createPoll(
          null,
          title,
          description,
          filteredOptions,
          false,
          status,
          pollType
        );
        toast.success("Poll created successfully! 🎉");
        router.push("/");
      } else {
        await createPoll(
          user.id,
          title,
          description,
          filteredOptions,
          requiresLogin,
          status,
          pollType
        );
        toast.success("Poll created successfully! 🎉");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
          <p className="text-muted-foreground">Loading poll creator...</p>
        </motion.div>
      </div>
    );
  }

  const filledOptions = options.filter((option) => option.trim() !== "").length;
  const progressPercentage = calculatePollProgress(
    title,
    filledOptions,
    options.length,
    status,
    pollType
  );
  const isFormValid = title.trim() !== "" && filledOptions >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header */}
      <motion.header
        className="border-b border-border bg-card/80 backdrop-blur-lg shadow-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={user ? "/dashboard" : "/"}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {user ? "Back to Dashboard" : "Back to Home"}
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {user ? "Create New Poll" : "Create Public Poll"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Build engaging surveys in minutes
                  </p>
                </div>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Pro User
                </Badge>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {user.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.email?.split("@")[0]}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <div className="container py-8 dark">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Guest User Alert */}
          {!user && (
            <motion.div variants={itemVariants}>
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">
                  Guest Mode
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  You're creating a public poll. Anyone with the link can vote.{" "}
                  <Link
                    href="/auth/login?redirectedFrom=/polls/new"
                    className="underline font-medium hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    Sign in
                  </Link>{" "}
                  for advanced features and poll management.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Progress Indicator */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Progress
              </span>

              <span className="text-sm text-muted-foreground">
                {progressPercentage}% Complete
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 w-full rounded-full bg-muted dark:bg-gray-700"
            />
          </motion.div>

          {/* Main Form */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-muted/30 bg-gray-800">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold">
                      Poll Details
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Fill out the information below to create your poll
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Target className="h-3 w-3" />
                      {pollType === "single_choice"
                        ? "Single Choice"
                        : "Multiple Choice"}
                    </Badge>
                    {status && (
                      <Badge
                        className={cn(
                          "text-white gap-1",
                          getStatusConfig(status).color
                        )}
                      >
                        {(() => {
                          const StatusIcon = getStatusConfig(status).icon;
                          return <StatusIcon className="h-3 w-3" />;
                        })()}
                        {getStatusConfig(status).label}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <fieldset disabled={loading} className="space-y-6 ">
                    {/* Poll Title */}
                    <motion.div variants={itemVariants} className="space-y-3">
                      <Label
                        htmlFor="title"
                        className="text-base font-semibold flex items-center gap-2"
                      >
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Poll Question
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="e.g., What's your favorite programming language?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg p-4 bg-muted/50 border-2 focus:border-primary transition-all duration-200 dark:border-gray-600 "
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Make it clear and engaging. This is what people will see
                        first.
                      </p>
                    </motion.div>

                    {/* Description */}
                    <motion.div variants={itemVariants} className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-base font-semibold"
                      >
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Add context, background, or instructions for your poll..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[100px] bg-muted/50 border-2 focus:border-primary transition-all duration-200 dark:border-gray-600 "
                        rows={4}
                      />
                    </motion.div>

                    {/* Options Section */}
                    <motion.div variants={itemVariants} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Poll Options ({filledOptions}/{options.length})
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          Min 2 • Max 10
                        </Badge>
                      </div>

                      <AnimatePresence>
                        {options.map((option, index) => (
                          <motion.div
                            key={index}
                            variants={optionVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="flex items-center gap-3"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                              {index + 1}
                            </div>
                            <Input
                              type="text"
                              placeholder={`Option ${index + 1} (e.g., ${
                                index === 0
                                  ? "JavaScript"
                                  : index === 1
                                  ? "Python"
                                  : "TypeScript"
                              })`}
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                              className="flex-1 bg-muted/50 border-2 focus:border-primary transition-all duration-200 dark:border-gray-600 "
                              required={index < 2}
                            />
                            {options.length > 2 && (
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(index)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {options.length < 10 && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addOption}
                            className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5 hover:dark:text-gray-200 transition-all duration-200 dark:border-gray-600 "
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Option
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Settings Section */}
                    <motion.div variants={itemVariants}>
                      <Card className="bg-muted/30 border-2 border-dashed dark:border-gray-700 ">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Poll Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Privacy Setting */}
                          {user && (
                            <div className="flex items-center justify-between p-4 bg-background rounded-lg border dark:border-gray-700 ">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                  <Label
                                    htmlFor="requires-login"
                                    className="font-medium"
                                  >
                                    Private Poll
                                  </Label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Require users to sign in before voting
                                </p>
                              </div>
                              <Switch
                                id="requires-login"
                                checked={requiresLogin}
                                onCheckedChange={setRequiresLogin}
                              />
                            </div>
                          )}

                          {/* Poll Type & Status Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <Label
                                htmlFor="poll-type"
                                className="font-medium"
                              >
                                Poll Type
                              </Label>
                              <Select
                                value={pollType}
                                onValueChange={(value) =>
                                  setPollType(value as any)
                                }
                              >
                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                  <SelectItem
                                    value="single_choice"
                                    className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Target className="h-4 w-4" />
                                      Single Choice
                                    </div>
                                  </SelectItem>
                                  <SelectItem
                                    value="multiple_choice"
                                    className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Check className="h-4 w-4" />
                                      Multiple Choice
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="status" className="font-medium">
                                Initial Status
                              </Label>
                              <Select
                                value={status}
                                onValueChange={(value) =>
                                  setStatus(value as any)
                                }
                              >
                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                  <SelectItem
                                    value="active"
                                    className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Eye className="h-4 w-4 text-emerald-500" />
                                      Active (Live)
                                    </div>
                                  </SelectItem>
                                  <SelectItem
                                    value="draft"
                                    className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Settings className="h-4 w-4 text-amber-500" />
                                      Draft
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="closed">
                                    <div className="flex items-center gap-2">
                                      <Lock className="h-4 w-4 text-red-500" />
                                      Closed
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </fieldset>

                  {/* Form Actions */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t dark:border-gray-700 "
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={loading}
                      className="hover:bg-muted/50"
                    >
                      Cancel
                    </Button>
                    <motion.div
                      whileHover={isFormValid ? { scale: 1.05 } : {}}
                      whileTap={isFormValid ? { scale: 0.95 } : {}}
                    >
                      <Button
                        type="submit"
                        disabled={loading || !isFormValid}
                        variant="gradient"
                        className="from-blue-500 to-blue-400"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating Poll...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Create Poll
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">
                      Pro Tips for Better Polls
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Keep your question clear and specific</li>
                      <li>• Provide balanced and comprehensive options</li>
                      <li>
                        • Use descriptive option names that are easy to
                        understand
                      </li>
                      <li>
                        • Consider your audience when choosing between public
                        and private
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
