"use client";

import { motion, Variants } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, QrCode, Users, Zap, Lock, Share2, Eye, Palette } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: "Real-time Results",
    description: "Watch votes come in live with instant updates and beautiful visualizations that refresh automatically.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-200 dark:border-emerald-800"
  },
  {
    icon: QrCode,
    title: "QR Code Sharing",
    description: "Generate QR codes instantly to share your polls with any audience, perfect for events and presentations.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-200 dark:border-blue-800"
  },
  {
    icon: Users,
    title: "Easy Participation",
    description: "No signup required for voters. Simple, accessible voting experience that works on any device.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-200 dark:border-purple-800"
  },
  {
    icon: BarChart3,
    title: "Beautiful Analytics",
    description: "Comprehensive insights with charts, graphs, and detailed breakdowns to understand your data better.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-200 dark:border-orange-800"
  },
  {
    icon: Lock,
    title: "Privacy Controls",
    description: "Choose between public polls or private polls that require authentication for secure voting.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-200 dark:border-red-800"
  },
  {
    icon: Share2,
    title: "Multiple Sharing Options",
    description: "Share via direct links, social media, embed codes, or download QR codes for offline sharing.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-200 dark:border-cyan-800"
  },
  {
    icon: Eye,
    title: "Vote Transparency",
    description: "Optional voter visibility settings and detailed voting analytics to track engagement patterns.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-200 dark:border-indigo-800"
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description: "Customize poll appearance with themes, colors, and branding options to match your style.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-200 dark:border-pink-800"
  }
];

// Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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
  rest: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
  hover: { 
    scale: 1.05,
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

export function Features() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need for 
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {" "}Modern Polling
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Powerful features designed to help you create engaging polls, gather insights, and make data-driven decisions
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              initial="rest"
              whileHover="hover"
            >
              <motion.div variants={cardHoverVariants}>
                <Card className={`text-center h-full border-0 bg-gradient-to-br from-card to-muted/30 ${feature.borderColor} transition-colors duration-300 dark:bg-gray-800`}>
                  <CardHeader className="pb-4">
                    <motion.div
                      className={`h-16 w-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mx-auto mb-6 relative`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className={`h-8 w-8 ${feature.color}`} />
                      <div className={`absolute inset-0 rounded-2xl ${feature.bgColor} opacity-20 blur-xl`}></div>
                    </motion.div>
                    <CardTitle className="text-xl font-bold mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-3xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">And Much More...</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Export to CSV/Excel</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Multiple Choice Options</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Poll Expiration Settings</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Mobile Responsive</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
