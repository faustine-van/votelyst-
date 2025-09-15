"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getStats() {
  const supabase = await createSupabaseServerClient();

  const { count: pollsCount, error: pollsError } = await supabase
    .from("polls")
    .select("*", { count: "exact", head: true });

  const { count: votesCount, error: votesError } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true });

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (pollsError || votesError || usersError) {
    return {
      pollsCount: 0,
      votesCount: 0,
      usersCount: 0,
    };
  }

  return {
    pollsCount,
    votesCount,
    usersCount: users.users.length,
  };
}
