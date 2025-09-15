"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function forgotPassword(
  prevState: { message?: string; error?: string } | null,
  formData: FormData
) {
  const supabase = await createSupabaseServerClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { message: "Password reset link sent. Please check your email." };
}
