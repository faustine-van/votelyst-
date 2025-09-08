"use client";

import { usePolls } from "./hooks/usePolls";
import { PollsList } from "@/components/PollsList";
import { AuthRequired } from "./components/AuthRequired";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { LoadingDisplay } from "./components/LoadingDisplay";
import { useAuth } from "@/app/context/AuthContext";

export default function PollsPage() {
  const { user, polls, loading, error, authLoading } = usePolls();
  const { session } = useAuth();

  if (authLoading || (user && loading)) {
    return <LoadingDisplay authLoading={authLoading} />;
  }

  if (!user || !session) {
    return <AuthRequired />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return <PollsList polls={polls} user={user} />;
}