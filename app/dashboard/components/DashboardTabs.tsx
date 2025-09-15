"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, BarChart3, Settings, User } from "lucide-react";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
      <TabsTrigger value="overview" className="flex items-center gap-2">
        <BarChart className="h-4 w-4" />
        Overview
      </TabsTrigger>
      <TabsTrigger value="polls" className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        My Polls
      </TabsTrigger>
      <TabsTrigger value="profile" className="flex items-center gap-2">
        <User className="h-4 w-4" />
        Profile
      </TabsTrigger>
      <TabsTrigger value="settings" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Settings
      </TabsTrigger>
    </TabsList>
  );
}
