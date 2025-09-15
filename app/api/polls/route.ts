
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = supabase.from("polls").select("*, options:poll_options(*), votes(*)");

  const search = searchParams.get("search");
  if (search) {
    query = query.ilike("question", `%${search}%`);
  }

  const status = searchParams.get("status");
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const visibility = searchParams.get("visibility");
  if (visibility && visibility !== "all") {
    query = query.eq("requires_login", visibility === "private");
  }

  const pollType = searchParams.get("poll_type");
  if (pollType && pollType !== "all") {
    query = query.eq("poll_type", pollType);
  }

  const { data: polls, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(polls);
}
