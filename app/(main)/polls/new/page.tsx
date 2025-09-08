'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, AlertCircle, Lock, ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createPoll } from '../actions';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';

export default function NewPollPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
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
    
    const filteredOptions = options.filter((option) => option.trim() !== '');
    if (filteredOptions.length < 2) {
      toast.error('Please provide at least two options.');
      return;
    }
    
    if (new Set(filteredOptions).size !== filteredOptions.length) {
        toast.error('Poll options must be unique.');
        return;
    }

    setLoading(true);

    try {
      if (!user) {
        if (requiresLogin) {
          toast.error("You must be logged in to create a private poll.");
          setLoading(false);
          return;
        }
        await createPoll(null, title, description, filteredOptions, false);
        toast.success('Poll created successfully');
        router.push('/');
      } else {
        await createPoll(user.id, title, description, filteredOptions, requiresLogin);
        toast.success('Poll created successfully');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Simplified view for non-logged in users, they can only create public polls
    // The logic in handleSubmit ensures they can't create private polls
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={user ? "/dashboard" : "/"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {user ? "Back to Dashboard" : "Back to Home"}
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">
                  {user ? "Create New Poll" : "Create Public Poll"}
                </h1>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user.email?.split('@')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container py-8">
        {!user && (
          <Alert className="max-w-2xl mx-auto mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You are not logged in</AlertTitle>
            <AlertDescription>
              You are creating a public poll. Anyone with the link will be able to vote. 
              <Link href="/auth/login?redirectedFrom=/polls/new" className="underline ml-2">Sign in</Link> for more options.
            </AlertDescription>
          </Alert>
        )}

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Create a New Poll</CardTitle>
            <CardDescription>Fill out the details below to create your poll.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset disabled={loading} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Poll Title</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="What's your question?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add more details about your poll..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Options</Label>
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
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
                     <Button type="button" variant="outline" onClick={addOption} className="mt-2">
                          Add Option
                      </Button>
                  </div>

                  {user && (
                    <div className="flex items-center space-x-2 pt-4">
                      <Switch id="requires-login" checked={requiresLogin} onCheckedChange={setRequiresLogin} />
                      <Label htmlFor="requires-login">Require users to log in to vote (Private Poll)</Label>
                    </div>
                  )}
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
                  {loading ? 'Creating...' : 'Create Poll'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}