'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function Header() {
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // Navigation will be handled automatically by the auth state change
  };

  return (
    <header className="border-b border-border bg-card" style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8" style={{ color: 'var(--primary)' }} />
            <Link href="/">
              <h1 className="text-2xl font-bold">Votelyst</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              // Show loading state
              <div className="animate-pulse flex gap-4">
                <div className="h-9 w-20 bg-gray-300 rounded"></div>
                <div className="h-9 w-24 bg-gray-300 rounded"></div>
              </div>
            ) : user ? (
              // Authenticated user
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.email?.split('@')[0]}
                </span>
                <Link href="/dashboard">
                  <Button variant='outline'>Dashboard</Button>
                </Link>
                <Link href="/polls">
                  <Button variant='ghost'>My Polls</Button>
                </Link>
                <Button onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              // Unauthenticated user
              <>
                <Link href="/auth/login">
                  <Button variant='outline'>Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}