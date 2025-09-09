import { signOut, deleteAccount } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function UserProfileCard({ user }: { user: any }) {
  if (!user) {
    return (
      <div className="flex items-center justify-center p-6 rounded-xl bg-muted shadow-md">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-sm w-full mx-auto rounded-2xl shadow-lg border bg-card p-6 space-y-4"
    >
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {user.user_metadata?.full_name || "User"}
        </h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <form action={signOut} className="flex-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="submit" className="w-full">
              Sign Out
            </Button>
          </motion.div>
        </form>
        <form action={deleteAccount} className="flex-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="submit" variant="destructive" className="w-full">
              Delete Account
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
