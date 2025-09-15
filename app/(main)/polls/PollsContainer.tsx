"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PollsSearchAndFilter } from "./components/PollsSearchAndFilter";
import { PollsList } from "./components/PollsList";
import { PollWithOptions } from "@/app/types/database";
import { LoadingDisplay } from "./components/LoadingDisplay";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function PollsContainer({ user, initialPolls }: { user: any, initialPolls: PollWithOptions[] }) {
  const [polls, setPolls] = useState<PollWithOptions[]>(initialPolls);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPolls.length > 0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const visibility = searchParams.get("visibility") || "all";
  const poll_type = searchParams.get("poll_type") || "all";

  useEffect(() => {
    setPolls(initialPolls);
  }, [initialPolls]);

  const loadMorePolls = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status,
        visibility,
        poll_type,
        page: (page + 1).toString(),
      });
      const response = await fetch(`/api/polls?${params.toString()}`);
      const newPolls = await response.json();

      if (newPolls.length > 0) {
        setPolls([...polls, ...newPolls]);
        setPage(page + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch more polls", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback(
    (filters: { search: string; status: string; visibility: string, poll_type: string }) => {
      const currentParams = new URLSearchParams(searchParams);
      const newParams = new URLSearchParams();
      newParams.set("search", filters.search);
      newParams.set("status", filters.status);
      newParams.set("visibility", filters.visibility);
      newParams.set("poll_type", filters.poll_type);

      if (currentParams.get('search') !== filters.search ||
          currentParams.get('status') !== filters.status ||
          currentParams.get('visibility') !== filters.visibility ||
          currentParams.get('poll_type') !== filters.poll_type) {
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="space-y-4">
      <PollsSearchAndFilter onFilterChange={handleFilterChange} />
      {loading && polls.length === 0 ? (
        <LoadingDisplay authLoading={false} />
      ) : (
        <PollsList polls={polls || []} user={user} />
      )}
      {hasMore && !loading && (
        <div className="flex justify-center my-4">
          <Button onClick={loadMorePolls} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
