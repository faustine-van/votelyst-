"use client";

import { motion, Variants } from "framer-motion";
import { UserProfileCard } from "./user-profile-card";
import { type User } from "@supabase/supabase-js";
import { type Poll } from "@/app/types/database";

interface UserProfileProps {
  user: User;
  polls: Poll[];
  totalVotes: number;
  totalViews: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
};

export function UserProfile({ user, polls, totalVotes, totalViews }: UserProfileProps) {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <UserProfileCard user={user} polls={polls} totalVotes={totalVotes} totalViews={totalViews} />
      </motion.div>
    </motion.div>
  );
}