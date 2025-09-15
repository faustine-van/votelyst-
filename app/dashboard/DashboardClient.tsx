"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { type Poll } from "@/app/types/database";
import { createSupabaseClient } from "@/lib/supabase/client";
import { updatePollStatus, updatePollPrivacy } from "@/app/(main)/polls/actions";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { signOut } from "../(auth)/actions";
import { toast } from "sonner";
import { PollsSearchAndFilter } from "@/app/(main)/polls/components/PollsSearchAndFilter";
import { DashboardTabs } from "./components/DashboardTabs";
import { StatsOverview } from "./components/StatsOverview";
import { PollsList } from "./components/PollsList";
import { UserProfile } from "./components/UserProfile";
import { Settings } from "./components/Settings";
import { DashboardAnalytics } from "./components/dashboard-analytics";
import { Tabs, TabsContent } from "@/components/ui/tabs";

interface DashboardClientProps {
  user: SupabaseUser;
  initialPolls: Poll[];
  initialTotalVotes: number;
  initialTotalViews: number;
}

export function DashboardClient({
  user,
  initialPolls,
  initialTotalVotes,
  initialTotalViews,
}: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [totalViews, setTotalViews] = useState(initialTotalViews);
  const [updatingPollId, setUpdatingPollId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tab = searchParams.get("tab");

  useEffect(() => {
    if (tab && ["overview", "polls", "profile", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };

  const handleFilterChange = useCallback(
    (filters: { search: string; status: string; visibility: string }) => {
      const currentParams = new URLSearchParams(searchParams);
      const newParams = new URLSearchParams();
      newParams.set("tab", "polls");
      newParams.set("search", filters.search);
      newParams.set("status", filters.status);
      newParams.set("visibility", filters.visibility);

      if (currentParams.get('search') !== filters.search ||
          currentParams.get('status') !== filters.status ||
          currentParams.get('visibility') !== filters.visibility) {
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  const handleStatusCycle = async (
    pollId: string,
    currentStatus: "draft" | "active" | "closed"
  ) => {
    const originalPolls = polls;
    const nextStatus =
      currentStatus === "draft"
        ? "active"
        : currentStatus === "active"
        ? "closed"
        : "draft";

    setPolls(
      polls.map((p) => (p.id === pollId ? { ...p, status: nextStatus } : p))
    );

    try {
      await updatePollStatus(pollId, nextStatus);
      toast.success(`Poll status updated to ${nextStatus}`);
    } catch (error) {
      setPolls(originalPolls);
      toast.error("Failed to update poll status");
    } finally {
      setUpdatingPollId(null);
    }
  };

  const handlePrivacyChange = async (
    pollId: string,
    requires_login: boolean
  ) => {
    const originalPolls = polls;
    setUpdatingPollId(pollId);
    setPolls(
      polls.map((p) => (p.id === pollId ? { ...p, requires_login } : p))
    );
    try {
      await updatePollPrivacy(pollId, requires_login);
      toast.success("Poll privacy updated");
    } catch (error) {
      setPolls(originalPolls);
      toast.error("Failed to update poll privacy");
    } finally {
      setUpdatingPollId(null);
    }
  };

  const handleDelete = async (pollId: string) => {
    setUpdatingPollId(pollId);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.from("polls").delete().eq("id", pollId);
      if (error) throw error;

      const deletedPoll = polls.find((p) => p.id === pollId);
      const remainingPolls = polls.filter((p) => p.id !== pollId);
      setPolls(remainingPolls);

      // Recalculate total votes and views
      const remainingIds = remainingPolls.map((p) => p.id);
      if (remainingIds.length === 0) {
        setTotalVotes(0);
        setTotalViews(0);
      } else {
        const { count, error: countErr } = await supabase
          .from("votes")
          .select("*", { count: "planned", head: true })
          .in("poll_id", remainingIds);
        if (!countErr) setTotalVotes(count ?? 0);
        if (deletedPoll) {
          setTotalViews((prev) => prev - deletedPoll.view_count);
        }
      }
      toast.success("Poll deleted successfully");
    } catch (error) {
      console.error("Error deleting poll:", error);
      toast.error("Failed to delete poll. Please try again.");
    } finally {
      setUpdatingPollId(null);
    }
  };

  

  if (!isMounted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Dashboard</h2>
            <p className="text-muted-foreground">
              Manage your polls and view insights
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} />

          <motion.div layout>
            <TabsContent value="overview" className="space-y-6">
              <div>
                <DashboardAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="polls" className="space-y-6">
              <StatsOverview
                polls={polls}
                totalVotes={totalVotes}
                totalViews={totalViews}
              />
              <PollsSearchAndFilter onFilterChange={handleFilterChange} />
              <PollsList
                polls={polls}
                updatingPollId={updatingPollId}
                handleStatusCycle={handleStatusCycle}
                handlePrivacyChange={handlePrivacyChange}
                handleDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="profile">
              <UserProfile user={user} polls={polls} totalVotes={totalVotes} totalViews={totalViews} />
            </TabsContent>

            <TabsContent value="settings">
              <Settings />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </motion.div>
  );
}