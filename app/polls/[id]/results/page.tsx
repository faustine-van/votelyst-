'use client';

import { useEffect, useState } from 'react';
import { getPollResults } from '@/app/utils/database';
import { type PollWithResults } from '@/app/types/database';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PollResultsPage({ params }: { params: { id: string } }) {
  const [poll, setPoll] = useState<PollWithResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPollResults = async () => {
      const pollResults = await getPollResults(params.id);
      setPoll(pollResults);
      setLoading(false);
    };

    fetchPollResults();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!poll) {
    return <div>Poll not found.</div>;
  }

  const data = poll.results.map(result => ({
    name: result.option_text,
    votes: result.vote_count,
  }));

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">{poll.question}</h1>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="votes" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
