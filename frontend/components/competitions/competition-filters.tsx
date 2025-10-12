"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface CompetitionFiltersProps {
  onFiltersChange: (filters: {
    searchTerm: string;
    gradeFilter: string;
    statusFilter: string;
    showFavourites?: boolean;
  }) => void;
  showFavouritesToggle?: boolean;
}

export function CompetitionFilters({
  onFiltersChange,
  showFavouritesToggle,
}: CompetitionFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update filters when any value changes
  React.useEffect(() => {
    if (isMounted) {
      onFiltersChange({
        searchTerm,
        gradeFilter,
        statusFilter,
        showFavourites,
      });
    }
  }, [
    searchTerm,
    gradeFilter,
    statusFilter,
    showFavourites,
    onFiltersChange,
    isMounted,
  ]);

  // Return an empty placeholder until client-side hydration is complete
  if (!isMounted) {
    return <div className="mb-8 relative z-20"></div>;
  }

  return (
    <div
      className="relative z-20 mb-8 overflow-hidden rounded-3xl border border-indigo-200/60 bg-white/85 p-6 shadow-[0_25px_60px_-30px_rgba(60,102,219,0.35)] backdrop-blur-lg transition dark:border-indigo-500/40 dark:bg-[#101c2a]/85 sm:p-8"
      suppressHydrationWarning
    >
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-indigo-500 dark:text-indigo-300" />
          <Input
            placeholder="Search competitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-indigo-200/40 bg-white/90 py-3 pl-10 pr-4 text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400/60 dark:border-indigo-500/40 dark:bg-[#0b1a27]/80 dark:text-gray-100 dark:placeholder:text-gray-400"
          />
        </div>

        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-full rounded-full border border-indigo-200/50 bg-white/80 py-6 text-sm text-gray-700 shadow-sm focus:ring-indigo-400/60 dark:border-indigo-500/50 dark:bg-[#0f2539]/70 dark:text-gray-100 lg:w-48">
            <SelectValue placeholder="Grade Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="Pre-Secondary">Pre-Secondary</SelectItem>
            <SelectItem value="9-10">Grades 9-10</SelectItem>
            <SelectItem value="11-12">Grades 11-12</SelectItem>
            <SelectItem value="9-12">Grades 9-12</SelectItem>
            <SelectItem value="Post-Secondary">Post-Secondary</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full rounded-full border border-indigo-200/50 bg-white/80 py-6 text-sm text-gray-700 shadow-sm focus:ring-indigo-400/60 dark:border-indigo-500/50 dark:bg-[#0f2539]/70 dark:text-gray-100 lg:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closing-soon">Closing Soon</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        {showFavouritesToggle && (
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              showFavourites
                ? "border border-indigo-500 bg-indigo-500 text-white shadow hover:bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                : "border border-indigo-200/60 bg-white/70 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-500/40 dark:bg-[#0f2539]/70 dark:text-indigo-200 dark:hover:bg-indigo-900/40"
            }`}
            onClick={() => setShowFavourites((prev) => !prev)}
          >
            {showFavourites ? "Showing Favourites" : "Show Favourites"}
          </button>
        )}
      </div>
    </div>
  );
}
