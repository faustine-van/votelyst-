'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getPoll, updatePoll } from '@/app/utils/database';
import { type Poll, type PollOption } from '@/app/types/database';
import { toast } from 'sonner';
import { X, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function EditPollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { user, loading: authLoading } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<Partial<PollOption>[]>([{ option_text: '' }, { option_text: '' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectedFrom=/polls/' + id + '/edit');
    }
  }, [user, authLoading, router, id]);

  useEffect(() => {
    const fetchPoll = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const pollData = await getPoll(id);
        if (pollData) {
          // Check if user owns this poll
          if (pollData.user_id !== user.id) {
            setError('You do not have permission to edit this poll.');
            setLoading(false);
            return;
          }
          setPoll(pollData);
          setTitle(pollData.question);
          setDescription(pollData.description || '');
          setOptions(pollData.options || [{ option_text: '' }, { option_text: '' }]);
        } else {
          setError('Poll not found.');
        }
      } catch (err) {
        console.error('Error fetching poll:', err);
        setError('Failed to load poll.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchPoll();
    }
  }, [id, user, authLoading]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], option_text: value };
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { option_text: '' }]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim() === '') {
      toast.error('Poll title cannot be empty.');
      return;
    }

    const filteredOptions = options.map(o => ({ ...o, option_text: o.option_text?.trim() || '' })).filter(o => o.option_text !== '');

    if (filteredOptions.length < 2) {
      toast.error('Please provide at least two options.');
      return;
    }

    if (new Set(filteredOptions.map(o => o.option_text)).size !== filteredOptions.length) {
      toast.error('Poll options must be unique.');
      return;
    }

    setLoading(true);

    if (poll) {
      try {
        await updatePoll(poll.id, title, description, filteredOptions);
        toast.success('Poll updated successfully');
        router.push('/dashboard');
      } catch (error: any) {
        toast.error(error.message);
      }
    }

    setLoading(false);
  };

  // Show loading state
  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading poll...</p>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to edit polls.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Poll Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The poll you're looking for doesn't exist or has been deleted.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-foreground">Edit Poll</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email?.split('@')[0]}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Poll</CardTitle>
            <CardDescription>Update the details of your poll.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset disabled={loading} className="space-y-4">
                <div>
                  <Label htmlFor="title">Poll Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your question?"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details about your poll..."
                  />
                </div>
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={option.id || index} className="flex items-center gap-2">
                        <Input
                          value={option.option_text || ''}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index)}
                            className="text-muted-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" onClick={addOption} className="mt-2">
                    Add Option
                  </Button>
                </div>
              </fieldset>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                  <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.back()}
                      disabled={loading}
                  >
                      Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}