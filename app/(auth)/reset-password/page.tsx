"use client";

import { useState } from "react";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [passwordReset, setPasswordReset] = useState(false);

  if (passwordReset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Password Reset Successful</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You can now log in with your new password.
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Link href="/login" className="text-sm text-center text-blue-600 hover:underline dark:text-blue-500">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
          Reset Your Password
        </h1>
        <ResetPasswordForm onPasswordReset={() => setPasswordReset(true)} />
      </div>
    </div>
  );
}
