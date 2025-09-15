
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Users, Calendar } from "lucide-react";
import { type Poll } from "@/app/types/database";
import { formatDate } from "@/app/utils/date";

type PollStatus = "active" | "draft" | "closed";
type PollVisibility = "Public" | "Private";

const statusColors: Record<PollStatus, string> = {
  active: "bg-[#2ECC71] hover:bg-[#2ECC71]/80",
  draft: "bg-[#7F8C8D] hover:bg-[#7F8C8D]/80",
  closed: "bg-[#E74C3C] hover:bg-[#E74C3C]/80",
};

const visibilityColors: Record<PollVisibility, string> = {
  Public: "text-[#3498DB]",
  Private: "text-[#E67E22]",
};

interface DashboardPollCardProps {
  poll: Poll;
}

export function DashboardPollCard({ poll }: DashboardPollCardProps) {
  const [status, setStatus] = useState<PollStatus>(poll.status);
  const [visibility, setVisibility] = useState<PollVisibility>(
    poll.requires_login ? "Private" : "Public"
  );

  const totalVotes = poll.votes?.length || 0;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex-grow">
          <Link href={`/polls/${poll.id}`} className="hover:underline">
            <CardTitle className="text-xl font-bold">{poll.question}</CardTitle>
          </Link>
          {poll.description && (
            <CardDescription className="mt-2">
              {poll.description}
            </CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[status]}`}>
            Status: {status}{" "}
            <span className={`ml-1 ${visibilityColors[visibility]}`}>
              ({visibility})
            </span>
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setStatus("active")}>
                  Set as Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("draft")}>
                  Set as Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("closed")}>
                  Close Poll
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setVisibility("Public")}>
                  Make Public
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setVisibility("Private")}>
                  Make Private
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          <span>
            Created on {formatDate(poll.created_at)}
          </span>
        </div>
        <div className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          <span>
            {totalVotes} {totalVotes === 1 ? "Vote" : "Votes"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
