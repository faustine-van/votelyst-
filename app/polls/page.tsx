import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../utils/supabase";
import { PlusCircle } from "lucide-react";

export const revalidate = 0;

export default async function PollsPage() {
  const { data: polls, error } = await supabase
    .from("polls")
    .select("*, poll_options(*)");

  if (error) {
    return <p>Error loading polls.</p>;
  }

  return (
    <div className="container py-8 m-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">All Polls</h1>
          <p className="text-muted-foreground">Browse and vote on polls.</p>
        </div>
        <Link href="/polls/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Poll
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
        {polls.map((poll) => (
          <Link key={poll.id} href={`/polls/${poll.id}`}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{poll.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {poll.poll_options.length} options
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
