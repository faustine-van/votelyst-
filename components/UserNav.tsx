"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { useState } from "react";

import {
  LogOut,
  Settings,
  User as UserIcon,
  BarChart3,
  Plus,
  Crown,
  Sparkles,
  ChevronDown,
  Bell,
  CreditCard,
} from "lucide-react";

export function UserNav() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const getInitials = (email: string, name?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const dropdownVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeOut",
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            className="relative h-10 px-3 rounded-xl bg-white/70 border border-slate-200 hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url}
                    alt="User avatar"
                  />
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {getInitials(
                      user.email || "",
                      user.user_metadata?.full_name
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm">
                  <div className="w-full h-full bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:block"
              >
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </motion.div>
            </div>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenuContent
            className="w-72 shadow-xl border border-slate-200 bg-white"
            align="end"
            forceMount
            sideOffset={8}
          >
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* User Profile Header */}
              <motion.div variants={itemVariants}>
                <DropdownMenuLabel className="font-normal p-0">
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg m-2">
                    <Avatar className="h-12 w-12 border-3 border-white shadow-md">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt="User avatar"
                      />
                      <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        {getInitials(
                          user.email || "",
                          user.user_metadata?.full_name
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-none text-slate-800">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <Badge className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 border-amber-200">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-slate-500 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 text-green-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-xs font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </motion.div>


              <DropdownMenuSeparator className="bg-slate-200" />

              <DropdownMenuGroup>
                <motion.div variants={itemVariants}>
                  <Link href="/dashboard?tab=overview">
                    <DropdownMenuItem className="cursor-pointer group hover:bg-blue-50 transition-colors duration-200 rounded-lg mx-2 my-1">
                      <div className="flex items-center w-full">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-700">
                          Dashboard
                        </span>
                        <Badge
                          variant="outline"
                          className="ml-auto text-xs border-slate-200"
                        >
                          ⌘D
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/polls">
                    <DropdownMenuItem className="cursor-pointer group hover:bg-green-50 transition-colors duration-200 rounded-lg mx-2 my-1">
                      <div className="flex items-center w-full">
                        <div className="p-2 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                          <BarChart3 className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium text-slate-700">
                          My Polls
                        </span>
                        <Badge
                          variant="outline"
                          className="ml-auto text-xs border-slate-200"
                        >
                          ⌘P
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/polls/new">
                    <DropdownMenuItem className="cursor-pointer group hover:bg-purple-50 transition-colors duration-200 rounded-lg mx-2 my-1">
                      <div className="flex items-center w-full">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                          <Plus className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-slate-700">
                          Create Poll
                        </span>
                        <Badge className="ml-auto text-xs bg-purple-100 text-purple-700 border-purple-200">
                          New
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </motion.div>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-slate-200" />

              {/* Secondary Actions */}
              <DropdownMenuGroup>
                <motion.div variants={itemVariants}>
                  <DropdownMenuItem className="cursor-pointer group hover:bg-slate-50 transition-colors duration-200 rounded-lg mx-2 my-1">
                    <div className="flex items-center w-full">
                      <div className="p-2 bg-slate-100 rounded-lg mr-3 group-hover:bg-slate-200 transition-colors">
                        <Bell className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="font-medium text-slate-700">
                        Notifications
                      </span>
                      <Badge className="ml-auto text-xs bg-red-100 text-red-700 border-red-200">
                        3
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/dashboard?tab=settings">
                    <DropdownMenuItem className="cursor-pointer group hover:bg-slate-50 transition-colors duration-200 rounded-lg mx-2 my-1">
                      <div className="flex items-center w-full">
                        <div className="p-2 bg-slate-100 rounded-lg mr-3 group-hover:bg-slate-200 transition-colors">
                          <Settings className="h-4 w-4 text-slate-600" />
                        </div>
                        <span className="font-medium text-slate-700">
                          Settings
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <DropdownMenuItem className="cursor-pointer group hover:bg-slate-50 transition-colors duration-200 rounded-lg mx-2 my-1">
                    <div className="flex items-center w-full">
                      <div className="p-2 bg-slate-100 rounded-lg mr-3 group-hover:bg-slate-200 transition-colors">
                        <CreditCard className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="font-medium text-slate-700">
                        Billing
                      </span>
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-slate-200" />

              {/* Premium Upgrade Section */}
              <motion.div variants={itemVariants}>
                <div className="mx-2 my-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-amber-100 rounded">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-semibold text-amber-800">
                      Upgrade to Premium
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mb-3 leading-relaxed">
                    Unlock unlimited polls, advanced analytics, and priority
                    support
                  </p>
                  <Button
                    size="sm"
                    className="w-full text-xs h-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm"
                  >
                    Upgrade Now - $9/month
                  </Button>
                </div>
              </motion.div>

              <DropdownMenuSeparator className="bg-slate-200" />

              {/* Sign Out */}
              <motion.div variants={itemVariants}>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer group hover:bg-red-50 transition-colors duration-200 rounded-lg mx-2 my-1"
                >
                  <div className="flex items-center w-full">
                    <div className="p-2 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                      <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="font-medium text-red-700">Sign Out</span>
                  </div>
                </DropdownMenuItem>
              </motion.div>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
}
