"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { PollWithOptions } from "@/app/types/database";

export function usePolls() {
  const { user, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState<PollWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPolls() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: pollsData, error: pollsError } = await supabase
          .from("polls")
          .select("*, options:poll_options(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (pollsError) {
          throw pollsError;
        }

        setPolls(pollsData || []);
      } catch (err) {
        console.error("Error fetching polls:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchPolls();
    }
  }, [user, authLoading]);

  return { user, polls, loading, error, authLoading };
}