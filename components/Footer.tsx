'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Votelyst. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          <motion.div whileHover={{ scale: 1.1 }} style={{ display: 'inline-block' }}>
            <Link href="/privacy" className="text-sm hover:underline">
              Privacy Policy
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} style={{ display: 'inline-block' }}>
            <Link href="/terms" className="text-sm hover:underline">
              Terms of Service
            </Link>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
