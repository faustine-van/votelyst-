import { getUser } from "@/lib/supabase/server";
import { PollsContainer } from "./PollsContainer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PollWithOptions } from "@/app/types/database";
import { AuthRequired } from "./components/AuthRequired";

export default async function PollsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const user = await getUser();

  if (!user) {
    return <AuthRequired />;
  }

  const supabase = await createSupabaseServerClient();

  // Await searchParams before accessing its properties
  const params = await searchParams;
  
  const search = (params.search as string) || "";
  const status = (params.status as string) || "all";
  const visibility = (params.visibility as string) || "all";
  const poll_type = (params.poll_type as string) || "all";
  const page = parseInt(params.page as string, 10) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("polls")
    .select("*, options:poll_options(*), votes(*)")
    .eq('user_id', user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike("question", `%${search}%`);
  }

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (visibility !== "all") {
    query = query.eq("requires_login", visibility === "private");
  }

  if (poll_type !== "all") {
    query = query.eq("poll_type", poll_type);
  }

  const { data: polls, error } = await query;

  if (error) {
    console.error("Failed to fetch polls", error);
    return <div>Error loading polls.</div>;
  }

  return <PollsContainer user={user} initialPolls={polls as PollWithOptions[]} />;
}
