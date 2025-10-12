"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { OPPORTUNITY_TYPE_OPTIONS } from "@/lib/constants/opportunity-types";

export interface OpportunityFilterState {
  searchTerm: string;
  categoryFilter: string;
  formatFilter: string;
  costFilter: string;
  statusFilter: string;
}

const EMPTY_FILTERS: OpportunityFilterState = {
  searchTerm: "",
  categoryFilter: "",
  formatFilter: "",
  costFilter: "",
  statusFilter: "",
};

interface OpportunityFiltersProps {
  filters: OpportunityFilterState;
  onFiltersChange: (filters: OpportunityFilterState) => void;
}

export function OpportunityFilters({
  filters,
  onFiltersChange,
}: OpportunityFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (updates: Partial<OpportunityFilterState>) => {
    onFiltersChange({
      ...filters,
      ...updates,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange(EMPTY_FILTERS);
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.categoryFilter ||
    filters.formatFilter ||
    filters.costFilter ||
    filters.statusFilter;

  const costLabels: Record<string, string> = {
    free: "Free",
    paid: "Paid",
    unspecified: "Not Specified",
  };

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-[0_25px_60px_-30px_rgba(27,94,52,0.45)] backdrop-blur-lg transition dark:border-emerald-500/40 dark:bg-[#101c2a]/85 sm:p-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#19613F]/60 dark:text-[#2CA15F]/60 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search opportunities by title, organizer, or description..."
          value={filters.searchTerm}
          onChange={(e) => updateFilters({ searchTerm: e.target.value })}
          className="w-full rounded-full border border-emerald-200/40 bg-white/90 py-3 pl-10 pr-4 text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400/60 dark:border-emerald-600/40 dark:bg-[#0b1a27]/80 dark:text-gray-100"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-full border-emerald-200/60 bg-white/70 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-600/50 dark:bg-[#0f2236]/70 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100/70 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-100"
          >
            <X className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Opportunity Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Opportunity Type
            </label>
            <Select
              value={filters.categoryFilter || "all"}
              onValueChange={(value) =>
                updateFilters({ categoryFilter: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="rounded-full border border-emerald-200/50 bg-white/85 py-6 text-sm text-gray-700 shadow-sm focus:ring-emerald-400/60 dark:border-emerald-600/50 dark:bg-[#0f2539]/70 dark:text-gray-100">
                <SelectValue placeholder="All Opportunity Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Opportunity Types</SelectItem>
                {OPPORTUNITY_TYPE_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format
            </label>
            <Select
              value={filters.formatFilter || "all"}
              onValueChange={(value) =>
                updateFilters({ formatFilter: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="rounded-full border border-emerald-200/50 bg-white/85 py-6 text-sm text-gray-700 shadow-sm focus:ring-emerald-400/60 dark:border-emerald-600/50 dark:bg-[#0f2539]/70 dark:text-gray-100">
                <SelectValue placeholder="All Formats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="In-person">In-person</SelectItem>
                <SelectItem value="Virtual">Virtual</SelectItem>
                <SelectItem value="In-person and Virtual">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cost Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cost
            </label>
            <Select
              value={filters.costFilter || "all"}
              onValueChange={(value) =>
                updateFilters({ costFilter: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="rounded-full border border-emerald-200/50 bg-white/85 py-6 text-sm text-gray-700 shadow-sm focus:ring-emerald-400/60 dark:border-emerald-600/50 dark:bg-[#0f2539]/70 dark:text-gray-100">
                <SelectValue placeholder="All Costs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Costs</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unspecified">Not Specified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={filters.statusFilter || "all"}
              onValueChange={(value) =>
                updateFilters({ statusFilter: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="rounded-full border border-emerald-200/50 bg-white/85 py-6 text-sm text-gray-700 shadow-sm focus:ring-emerald-400/60 dark:border-emerald-600/50 dark:bg-[#0f2539]/70 dark:text-gray-100">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 rounded-2xl border border-emerald-100/60 bg-emerald-50/60 p-4 text-sm shadow-inner dark:border-emerald-700/40 dark:bg-emerald-900/30">
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <div className="flex items-center gap-1 bg-[#2CA15F]/10 dark:bg-[#2CA15F]/20 text-[#19613F] dark:text-[#2CA15F] px-3 py-1 rounded-full text-sm">
                <span>Search: "{filters.searchTerm}"</span>
                <button
                  onClick={() => updateFilters({ searchTerm: "" })}
                  className="ml-1 hover:bg-[#2CA15F]/20 dark:hover:bg-[#2CA15F]/30 rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.categoryFilter && (
              <div className="flex items-center gap-1 bg-[#19613F]/10 dark:bg-[#19613F]/20 text-[#19613F] dark:text-[#2CA15F] px-3 py-1 rounded-full text-sm">
                <span>Type: {filters.categoryFilter}</span>
                <button
                  onClick={() => updateFilters({ categoryFilter: "" })}
                  className="ml-1 hover:bg-[#19613F]/20 dark:hover:bg-[#19613F]/30 rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.formatFilter && (
              <div className="flex items-center gap-1 bg-[#2CA15F]/20 dark:bg-[#2CA15F]/30 text-[#19613F] dark:text-[#2CA15F] px-3 py-1 rounded-full text-sm">
                <span>Format: {filters.formatFilter}</span>
                <button
                  onClick={() => updateFilters({ formatFilter: "" })}
                  className="ml-1 hover:bg-[#2CA15F]/30 dark:hover:bg-[#2CA15F]/40 rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.costFilter && (
              <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-sm">
                <span>Cost: {costLabels[filters.costFilter] ?? filters.costFilter}</span>
                <button
                  onClick={() => updateFilters({ costFilter: "" })}
                  className="ml-1 hover:bg-amber-200 dark:hover:bg-amber-800/40 rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.statusFilter && (
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                <span>Status: {filters.statusFilter}</span>
                <button
                  onClick={() => updateFilters({ statusFilter: "" })}
                  className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
