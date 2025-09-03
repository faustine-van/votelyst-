"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
    return
  }

  return redirect("/")
}

export async function deleteAccount() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    console.error("Error getting user:", error)
    return
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id)

  if (deleteError) {
    console.error("Error deleting user:", deleteError)
    return
  }

  return redirect("/")
}