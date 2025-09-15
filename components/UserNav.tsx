'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

import { 
  LogOut, 
  Settings, 
  User as UserIcon, 
  BarChart3,
  Plus,
  Crown,
  Sparkles,
  ChevronDown
} from 'lucide-react';

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
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
        ease: "easeOut"
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="ghost" className="relative h-10 px-3 rounded-full bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted to-muted/50 transition-all duration-200 ">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-7 w-7 border-2 border-primary/20">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url} 
                    alt="User avatar" 
                  />
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    {getInitials(user.email || '', user.user_metadata?.full_name)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full">
                  <div className="w-full h-full bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
              
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:block"
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      
      <AnimatePresence>
        {isOpen && (
          <DropdownMenuContent 
            className="w-64 shadow-xl border-0 bg-card/95 backdrop-blur-lg" 
            align="end" 
            forceMount
          >
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div variants={itemVariants}>
                <DropdownMenuLabel className="font-normal p-0">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg m-2">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url} 
                        alt="User avatar" 
                      />
                      <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                        {getInitials(user.email || '', user.user_metadata?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-none text-foreground">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-xs font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </motion.div>

              <DropdownMenuSeparator className="bg-border/50" />
              
              <DropdownMenuGroup>
                <motion.div variants={itemVariants}>
                  <Link href="/dashboard?tab=overview">
                    <DropdownMenuItem className="cursor-pointer group hover:bg-primary/5 transition-colors duration-200 rounded-md mx-2 my-1">
                      <div className="flex items-center w-full">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                          <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">Dashboard</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Link href="/polls">
                    <DropdownMenuItem className="cursor-pointer group hover:bg-primary/5 transition-colors duration-200 rounded-md mx-2 my-1">
                      <div className="flex items-center w-full">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-md mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                          <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium">My Polls</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Link href="/polls/new">
                    <DropdownMenuItem className="cursor-pointer group hover:bg-primary/5 transition-colors duration-200 rounded-md mx-2 my-1">
                      <div className="flex items-center w-full">
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-md mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                          <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-medium">Create Poll</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          New
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Link href="/dashboard?tab=settings">
                    <DropdownMenuItem className="cursor-pointer group hover:bg-primary/5 transition-colors duration-200 rounded-md mx-2 my-1">
                      <div className="flex items-center w-full">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-medium">Settings</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </motion.div>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator className="bg-border/50" />
              
              {/* Premium Section */}
              <motion.div variants={itemVariants}>
                <div className="mx-2 my-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      Premium Features
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                    Unlock advanced analytics and unlimited polls
                  </p>
                  <Button size="sm" className="w-full text-xs h-7 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    Upgrade Now
                  </Button>
                </div>
              </motion.div>
              
              <DropdownMenuSeparator className="bg-border/50" />
              
              <motion.div variants={itemVariants}>
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="cursor-pointer group hover:bg-red-50 dark:hover:bg-red-950 transition-colors duration-200 rounded-md mx-2 my-1"
                >
                  <div className="flex items-center w-full">
                    <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-md mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-medium text-red-700 dark:text-red-400">Sign Out</span>
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