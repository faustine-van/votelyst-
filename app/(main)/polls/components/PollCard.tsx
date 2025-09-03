import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PollWithOptions } from "@/app/types/database";

interface PollCardProps {
  poll: PollWithOptions;
}

export function PollCard({ poll }: PollCardProps) {
  return (
    <Link href={`/polls/results/${poll.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
        <CardHeader>
          <CardTitle className="text-lg line-clamp-2">{poll.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{poll.options?.length || 0} options</span>
            <span>{new Date(poll.created_at).toLocaleDateString()}</span>
          </div>
          {poll.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {poll.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}