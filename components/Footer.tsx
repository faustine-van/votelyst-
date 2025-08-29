'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} PollCraft. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          <Link href="/privacy" className="text-sm hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
