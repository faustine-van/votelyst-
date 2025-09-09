'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { motion } from 'framer-motion';

export default function Header() {
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
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
                
                {/* <Link href="/dashboard">
                  <Button variant='outline'>Dashboard</Button>
                </Link> */}
                <Link href="/polls">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant='ghost'>My Polls</Button>
                  </motion.div>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button onClick={handleSignOut}>Sign Out</Button>
                </motion.div>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.email?.split('@')[0]}
                </span>
              </>
            ) : (
              // Unauthenticated user
              <>
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant='outline'>Sign In</Button>
                  </motion.div>
                </Link>
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button>Get Started</Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
