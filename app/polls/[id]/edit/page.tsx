'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { getPoll, updatePoll } from '@/app/utils/database';
import { type Poll } from '@/app/types/database';

export default function EditPollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoll = async () => {
      const pollData = await getPoll(params.id);
      if (pollData) {
        setPoll(pollData);
        setTitle(pollData.question);
        setDescription(pollData.description || '');
      }
      setLoading(false);
    };

    fetchPoll();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (poll) {
      await updatePoll(poll.id, title, description);
      router.push('/dashboard');
    }

    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!poll) {
    return <div>Poll not found.</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Poll</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
