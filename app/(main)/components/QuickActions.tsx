"use client";

import { motion, Variants } from "framer-motion";
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  List, 
  BarChart, 
  Settings, 
  Plus, 
  TrendingUp, 
  Users,
  ArrowRight,
  Activity
} from 'lucide-react';

interface QuickActionsProps {
  user?: any;
}

const quickActions = [
  {
    title: "My Polls",
    description: "View and manage all your polls",
    icon: List,
    href: "/dashboard?tab=polls",
    buttonText: "View All Polls",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "hover:bg-blue-500/20",
    borderColor: "border-blue-200 dark:border-blue-800"
  },
  {
    title: "Analytics",
    description: "Track performance and insights",
    icon: BarChart,
    href: "/dashboard?tab=overview",
    buttonText: "View Analytics",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    hoverColor: "hover:bg-emerald-500/20",
    borderColor: "border-emerald-200 dark:border-emerald-800"
  },
  {
    title: "Settings",
    description: "Manage your account preferences",
    icon: Settings,
    href: "/dashboard?tab=settings",
    buttonText: "Manage Account",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hoverColor: "hover:bg-purple-500/20",
    borderColor: "border-purple-200 dark:border-purple-800"
  }
];

// Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const cardHoverVariants: Variants = {
  rest: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
  hover: { 
    scale: 1.05,
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

export function QuickActions({ user }: QuickActionsProps) {
  if (!user) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-muted/20 via-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-20 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto max-w-5xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Quick Actions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Jump right into managing your polls, viewing analytics, or updating your settings
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {quickActions.map((action, index) => (
            <motion.div key={index} variants={itemVariants} initial="rest" whileHover="hover">
              <motion.div variants={cardHoverVariants}>
                <Card className={`h-full border-0 bg-gradient-to-br from-card to-muted/30 ${action.borderColor} transition-all duration-300`}>
                  <CardHeader className="flex flex-col items-center space-y-4 pb-4">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl ${action.bgColor} ${action.hoverColor} flex items-center justify-center transition-colors duration-300 relative`}
                      whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <action.icon className={`h-8 w-8 ${action.color}`} />
                      <div className={`absolute inset-0 rounded-2xl ${action.bgColor} opacity-20 blur-lg scale-150`}></div>
                    </motion.div>
                    <div className="text-center">
                      <CardTitle className="text-xl font-bold mb-2">{action.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Link href={action.href}>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" className="w-full group hover:bg-muted/50 transition-all duration-200">
                          {action.buttonText}
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                        </Button>
                      </motion.div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
              <Activity className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <div className="text-lg font-semibold">5</div>
              <div className="text-xs text-muted-foreground">Active Polls</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
              <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-semibold">1.2K</div>
              <div className="text-xs text-muted-foreground">Total Votes</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
              <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-lg font-semibold">85%</div>
              <div className="text-xs text-muted-foreground">Engagement</div>
            </div>
          </div>
        </motion.div>

        {/* Create new poll CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Link href="/polls/new">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Plus className="h-5 w-5 mr-2" />
                Create New Poll
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
