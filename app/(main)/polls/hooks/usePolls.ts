import { createSupabaseClient } from "@/lib/supabase/client";
import { PollWithOptions } from "@/app/types/database";
import useSWR from "swr";
import { useAuth } from "@/app/context/AuthContext";

const supabase = createSupabaseClient();

const fetchPolls = async (userId: string | undefined): Promise<PollWithOptions[]> => {
  if (!userId) {
    return [];
  }

  const { data: polls, error } = await supabase
    .from("polls")
    .select("*, poll_options(*)")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
  return polls || [];
};

export const usePolls = () => {
  const { user, loading: authLoading } = useAuth();

  const {
    data: polls,
    error,
    isLoading,
  } = useSWR<PollWithOptions[]>(user ? `polls-${user.id}` : null, () => fetchPolls(user?.id));

  return {
    polls: polls || [],
    loading: isLoading, // for compatibility
    error: error ? error.message : null,
    user,
    authLoading,
  };
};