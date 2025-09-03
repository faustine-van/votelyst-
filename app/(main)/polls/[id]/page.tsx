"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPoll } from "@/app/utils/database";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { PollWithOptions } from "@/app/types/database";

export default function PollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [poll, setPoll] = useState<PollWithOptions | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirect=/polls/${params.id}`);
        return;
      }

      try {
        const pollData = await getPoll(params.id);
        if (pollData) {
          const { data: vote, error: voteError } = await supabase
            .from("votes")
            .select("id")
            .eq("poll_id", pollData.id)
            .eq("user_id", user.id)
            .single();

          if (vote) {
            router.push(`/polls/${params.id}/results`);
            return;
          }
          setPoll(pollData);
        } else {
          toast.error("Poll not found.");
          router.push("/polls");
        }
      } catch (error: any) {
        toast.error(error.message);
      }

      setLoading(false);
    };

    fetchPoll();
  }, [params.id, router]);

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error("Please select an option to vote.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    

    if (!user) {
        toast.error("You must be logged in to vote.");
        setIsSubmitting(false);
        router.push(`/login?redirect=/polls/${params.id}`);
        return;
    }

    try {
        const { error } = await supabase.from('votes').insert({
            poll_id: params.id,
            option_id: selectedOption,
            user_id: user.id,
        });

        if (error) {
            throw error;
        }

      toast.success("Vote submitted successfully!");
      router.push(`/polls/${params.id}/results`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit vote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Poll not found</h1>
          <p className="text-muted-foreground">This poll may have been deleted or the link is incorrect.</p>
          <Button onClick={() => router.push("/polls")} className="mt-4">Go back to polls</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{poll.question}</h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-6">{poll.description}</p>
        
        <RadioGroup onValueChange={setSelectedOption} className="space-y-4">
          {poll.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {option.option_text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button 
          onClick={handleVote} 
          disabled={isSubmitting || !selectedOption}
          className="w-full mt-8 py-3 text-lg font-semibold"
        >
          {isSubmitting ? "Submitting..." : "Submit Vote"}
        </Button>
      </div>
    </div>
  );
}

