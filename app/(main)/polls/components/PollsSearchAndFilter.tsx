"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function PollsSearchAndFilter({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [visibility, setVisibility] = useState(searchParams.get("visibility") || "all");
  const [pollType, setPollType] = useState(searchParams.get("poll_type") || "all");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (typeof onFilterChange === 'function') {
        onFilterChange({ search: searchTerm, status, visibility, poll_type: pollType });
      }
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchTerm, status, visibility, pollType, onFilterChange]);

  return (
    <div className="flex items-center space-x-4 p-4 mb-4 dark:bg-gray-800 rounded">
      <div className="relative w-full">
        <Input
          placeholder="Search polls..."
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
        />
      </div>
      
      {/* Status Select */}
      <Select onValueChange={setStatus} defaultValue={status}>
        <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
          <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            All Statuses
          </SelectItem>
          <SelectItem value="draft" className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            Draft
          </SelectItem>
          <SelectItem value="active" className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            Active
          </SelectItem>
          <SelectItem value="closed" className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            Closed
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Visibility Select */}
      <Select onValueChange={setVisibility} defaultValue={visibility}>
        <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <SelectValue placeholder="Visibility" />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
          <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            All Visibilities
          </SelectItem>
          <SelectItem value="public" className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            Public
          </SelectItem>
          <SelectItem value="private" className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            Private
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Poll Type Select */}
      <Select onValueChange={setPollType} defaultValue={pollType}>
        <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <SelectValue placeholder="Poll Type" />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
          <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            All Types
          </SelectItem>
          <SelectItem value="single_choice" className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            Single Choice
          </SelectItem>
          <SelectItem value="multiple_choice" className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            Multiple Choice
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}