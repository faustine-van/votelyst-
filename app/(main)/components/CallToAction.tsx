"use client";

import { motion, Variants, easeInOut } from "framer-motion";
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Users, Zap, Shield, CheckCircle } from 'lucide-react';

interface CallToActionProps {
  user?: any;
}

const benefits = [
  "No credit card required",
  "Create unlimited polls",
  "Real-time analytics",
  "Export data anytime"
];

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
    y: [0, -8, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: easeInOut,
    },
  },
};

export function CallToAction({ user }: CallToActionProps) {
  if (user) return null;

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-primary/10 to-purple-600/10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <motion.div
          variants={floatingIconVariants}
          animate="float"
          className="absolute top-20 left-16 opacity-10"
        >
          <Users className="h-24 w-24 text-primary" />
        </motion.div>

        <motion.div
          variants={floatingIconVariants}
          animate="float"
          className="absolute top-32 right-20 opacity-10"
          style={{ transitionDelay: '1s' }}
        >
          <Zap className="h-16 w-16 text-purple-600" />
        </motion.div>

        <motion.div
          variants={floatingIconVariants}
          animate="float"
          className="absolute bottom-24 left-24 opacity-10"
          style={{ transitionDelay: '2s' }}
        >
          <Shield className="h-20 w-20 text-primary" />
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto max-w-5xl text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Main heading */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold">
              Ready to{" "}
              <span className="bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                get started?
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Join thousands of users creating engaging polls and gathering valuable insights. 
              Start building meaningful connections through data.
            </p>
          </motion.div>

          {/* Benefits list */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 shadow-lg"
              >
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Action buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-6 max-w-lg mx-auto"
          >
            <Link href="/register" className="flex-1 sm:flex-none">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  Sign Up Free
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </motion.div>
            </Link>

            <Link href="/login" className="flex-1 sm:flex-none">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto px-8 py-4 text-lg border-2 hover:bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Sign In
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div variants={itemVariants} className="pt-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100K+</div>
                <div className="text-sm text-muted-foreground">Polls Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                <div className="text-sm text-muted-foreground">Votes Collected</div>
              </div>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={itemVariants} className="pt-8">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full border-2 border-white dark:border-gray-900"></div>
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full border-2 border-white dark:border-gray-900"></div>
                <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <span className="text-sm font-medium ml-2">Trusted by 10,000+ users worldwide</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
