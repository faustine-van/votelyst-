"use client";

import { usePolls } from "./hooks/usePolls";
import { PollsList } from "@/components/PollsList";
import { AuthRequired } from "./components/AuthRequired";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { LoadingDisplay } from "./components/LoadingDisplay";

export default function PollsPage() {
  const { user, polls, loading, error, authLoading } = usePolls();

  if (authLoading || (user && loading)) {
    return <LoadingDisplay authLoading={authLoading} />;
  }

  if (!user) {
    return <AuthRequired />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return <PollsList polls={polls} user={user} />;
}