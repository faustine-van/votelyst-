"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
    return
  }

  return redirect("/")
}

import { createClient } from "@supabase/supabase-js";

export async function deleteAccount() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    console.error("Error getting user:", error)
    return
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(data.user.id)

  if (deleteError) {
    console.error("Error deleting user:", deleteError)
    return
  }

  return redirect("/")
}