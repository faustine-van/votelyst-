import { signOut, deleteAccount } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, Variants } from "framer-motion";
import { 
  User, 
  Mail, 
  Calendar, 
  LogOut, 
  Trash2, 
  Shield,
  Crown,
  Clock
} from "lucide-react";
import { formatDate } from "@/app/utils/date";

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    rotateY: -15
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  }
};

const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delay: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200
    }
  }
};

export function UserProfileCard({ user }: { user: any }) {
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-8 rounded-2xl bg-muted/50 shadow-lg border-2 border-dashed border-muted-foreground/20"
      >
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </motion.div>
    );
  }

  const userInitials = (user.user_metadata?.full_name || user.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = user.created_at ? formatDate(user.created_at) : 'Recently';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      className="max-w-md w-full mx-auto rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-card via-card to-muted/30 backdrop-blur-sm overflow-hidden dark:bg-gray-800"
    >
      {/* Header with avatar */}
      <CardHeader className="pb-4 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"  />
        <motion.div 
          className="relative z-10 space-y-4"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <div className="relative mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto shadow-lg mt-2 dark:bg-gray-700 ">
                {userInitials}
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-card rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {user.user_metadata?.full_name || "User"}
              </h2>
              <Badge variant="secondary" className="text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Member
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <p className="text-sm">{user.email}</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <p className="text-xs">Member since {memberSince}</p>
            </div>
          </motion.div>

          {/* User stats */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-center gap-4 p-4 bg-muted/20 rounded-xl">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">12</div>
                <div className="text-xs text-muted-foreground">Polls</div>
              </div>
              <div className="w-px bg-muted-foreground/20"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">248</div>
                <div className="text-xs text-muted-foreground">Votes</div>
              </div>
              <div className="w-px bg-muted-foreground/20"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">1.2k</div>
                <div className="text-xs text-muted-foreground">Views</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-0 pb-6">
        <motion.div 
          className="space-y-3"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <form action={signOut} className="w-full">
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </motion.div>
            </form>

            <form action={deleteAccount} className="w-full">
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  variant="destructive" 
                  className="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </motion.div>
            </form>
          </div>

          {/* Security notice */}
          <motion.div 
            variants={itemVariants}
            className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium">Your account is secure</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              All your data is encrypted and protected.
            </p>
          </motion.div>
        </motion.div>
      </CardContent>
    </motion.div>
  );
}