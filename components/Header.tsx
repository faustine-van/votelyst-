'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/app/utils/supabase';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { session } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant='outline'>Dashboard</Button>
                </Link>
                <Button onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
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