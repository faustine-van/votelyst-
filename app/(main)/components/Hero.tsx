"use client";

import { motion, Variants, easeInOut } from "framer-motion";
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BarChart3, Users, Zap, TrendingUp } from 'lucide-react';

interface HeroProps {
  user?: any;
}

// Container animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Item animation
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

// Floating icon animation
const floatingIconVariants: Variants = {
  float: {
    y: [0, -10, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easeInOut,
    },
  },
};

export function Hero({ user }: HeroProps) {
  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 py-20 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          variants={floatingIconVariants}
          animate="float"
          className="absolute top-20 left-10 opacity-20"
        >
          <BarChart3 className="h-16 w-16 text-primary" />
        </motion.div>

        <motion.div
          variants={floatingIconVariants}
          animate="float"
          className="absolute top-32 right-16 opacity-20"
          style={{ transitionDelay: '1s' }}
        >
          <Users className="h-12 w-12 text-primary" />
        </motion.div>

        <motion.div
          variants={floatingIconVariants}
          animate="float"
          className="absolute bottom-20 left-20 opacity-20"
          style={{ transitionDelay: '2s' }}
        >
          <TrendingUp className="h-14 w-14 text-primary" />
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div 
        className="container mx-auto max-w-5xl text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main heading */}
        <motion.div variants={itemVariants} className="space-y-6 mb-8">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-purple-600 bg-clip-text text-transparent leading-tight">
            Welcome to Votelyst
          </h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Create engaging polls, gather valuable insights, and make data-driven decisions with our modern polling platform.
          </motion.p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-6 mb-10 text-sm"
        >
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
            <Zap className="h-4 w-4 text-emerald-500" />
            <span>Real-time Results</span>
          </div>
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
            <Users className="h-4 w-4 text-blue-500" />
            <span>No Signup Required</span>
          </div>
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <span>Beautiful Analytics</span>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto"
        >
          {user ? (
            <>
              <Link href="/polls/new" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                  <Button size="lg" className="w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Create a Poll
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
              
              <Link href="/dashboard" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-muted/50 backdrop-blur-sm">
                    View Dashboard
                  </Button>
                </motion.div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                  <Button size="lg" className="w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
              
              <Link href="/polls/new" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-muted/50 backdrop-blur-sm">
                    <Users className="h-4 w-4 mr-2" />
                    Create Anonymous Poll
                  </Button>
                </motion.div>
              </Link>
            </>
          )}
        </motion.div>

        {/* Stats or trust indicators */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">10K+</div>
            <div className="text-sm text-muted-foreground">Polls Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">50K+</div>
            <div className="text-sm text-muted-foreground">Votes Collected</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">1K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
