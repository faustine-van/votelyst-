'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BarChart3, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { UserNav } from './UserNav';
import { useState } from 'react';

export default function Header() {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const headerVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.6
      }
    }
  };

  const logoVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    }
  };

  const menuItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const mobileMenuVariants: Variants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.header 
      // style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)' }}
      className="sticky top-0 z-50  bg-card/80 backdrop-blur-lg shadow-sm"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <motion.div 
              className="flex items-center gap-3"
              variants={logoVariants}
            >
              <div className="relative">
                <motion.div
                  whileHover={{ 
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                  className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg"
                >
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                </motion.div>
              </div>
              
              <Link href="/" className="group">
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Votelyst
                </motion.h1>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                <motion.div
                  custom={0}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link href="/polls">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      My Polls
                    </Button>
                  </Link>
                </motion.div>
                
                <motion.div
                  custom={1}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link href="/dashboard">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      Dashboard
                    </Button>
                  </Link>
                </motion.div>
              </nav>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md"></div>
                <div className="h-9 w-24 bg-muted animate-pulse rounded-md"></div>
              </motion.div>
            ) : user ? (
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Link href="/polls/new">
                  <Button 
                    size="sm" 
                    className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/80"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2"
                    >
                      Create Poll
                    </motion.span>
                  </Button>
                </Link>
                <UserNav />
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                  >
                    <motion.span whileHover={{ scale: 1.05 }}>
                      Sign In
                    </motion.span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm"
                    className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/80"
                  >
                    <motion.span whileHover={{ scale: 1.05 }}>
                      Get Started
                    </motion.span>
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-primary/10"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          variants={mobileMenuVariants}
          initial="hidden"
          animate={isMobileMenuOpen ? "visible" : "hidden"}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-3 border-t border-border mt-4">
            {user ? (
              <>
                <Link href="/polls" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    My Polls
                  </Button>
                </Link>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/polls/new" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
                    Create Poll
                  </Button>
                </Link>
                <div className="pt-2 border-t border-border">
                  <UserNav />
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}