'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Dummy data for a single poll
const poll = {
  id: 1,
  title: "What's your favorite programming language?",
  options: [
    { id: 1, text: 'JavaScript', votes: 150 },
    { id: 2, text: 'Python', votes: 300 },
    { id: 3, text: 'TypeScript', votes: 250 },
    { id: 4, text: 'Go', votes: 100 },
  ],
};

const totalVotes = poll.options.reduce((acc, option) => acc + option.votes, 0);

export default function PollDetailPage() {
  const { id } = useParams();

  return (
    <div className="container py-8">
      <Link href="/polls" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Polls
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {poll.options.map((option) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              return (
                <div key={option.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span>{option.text}</span>
                    <span>{option.votes} votes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full"
                      style={{ width: `${percentage}%`, backgroundColor: 'var(--primary)' }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Cast Your Vote</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {poll.options.map((option) => (
                <Button key={option.id} variant="outline">
                  {option.text}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

