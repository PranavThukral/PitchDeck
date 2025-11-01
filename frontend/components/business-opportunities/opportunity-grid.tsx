// [COMPLETE CODE for components/opportunities/opportunity-grid.tsx]

"use client";

import { useState, useEffect, useMemo } from "react";
import { OpportunityCard } from "./opportunity-card";
import { Loader2, AlertCircle } from "lucide-react";
import { OpportunityFilterState } from "./opportunity-filters";
import {
  deriveOpportunityType,
  OpportunityType,
} from "@/lib/constants/opportunity-types";

const opportunityTypeOrder: OpportunityType[] = [
  "Entrepreneurship",
  "Internship",
  "Leadership",
  "Mentorship & Learning",
];

// 1. UPDATED INTERFACE to use gradeTags
interface BusinessOpportunity {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  gradeTags: string[];
  startDate: string;
  endDate: string;
  cost: string;
  format: string;
  status: string;
  description: string;
  applicationType: string;
  applyUrl: string;
  category: string;
  opportunityType?: string[];
  derivedType?: OpportunityType;
}

interface OpportunityGridProps {
  filters: OpportunityFilterState;
}

export function OpportunityGrid({ filters }: OpportunityGridProps) {
  const [opportunities, setOpportunities] = useState<BusinessOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/business-opportunities");
        if (!response.ok) {
          throw new Error("Failed to load opportunities");
        }
        const data = await response.json();
        setOpportunities(data);
        setError(null);
      } catch (err) {
        console.error("Error loading opportunities:", err);
        setError("Failed to load business opportunities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadOpportunities();
  }, []);

  useEffect(() => {
    const savedFavourites = localStorage.getItem("favourite-opportunities");
    if (savedFavourites) {
      try {
        const favouriteIds = JSON.parse(savedFavourites);
        setFavourites(new Set(favouriteIds));
      } catch (err) {
        console.error("Error loading favourites:", err);
      }
    }
  }, []);

  const saveFavourites = (newFavourites: Set<string>) => {
    localStorage.setItem("favourite-opportunities", JSON.stringify(Array.from(newFavourites)));
    setFavourites(newFavourites);
  };

  const enrichedOpportunities = useMemo(() => {
    return opportunities.map((opportunity) => ({
      ...opportunity,
      derivedType: deriveOpportunityType({
        opportunityType: opportunity.opportunityType,
        category: opportunity.category,
        title: opportunity.title,
        description: opportunity.description,
      }),
    }));
  }, [opportunities]);

  const handleFavourite = (opportunityId: string) => {
    const newFavourites = new Set(favourites);
    if (newFavourites.has(opportunityId)) {
      newFavourites.delete(opportunityId);
    } else {
      newFavourites.add(opportunityId);
    }
    saveFavourites(newFavourites);
  };

  const filteredOpportunities = useMemo(() => {
    return enrichedOpportunities.filter((opportunity) => {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          opportunity.title.toLowerCase().includes(searchLower) ||
          opportunity.organizer.toLowerCase().includes(searchLower) ||
          opportunity.description.toLowerCase().includes(searchLower) ||
          opportunity.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.categoryFilter) {
        if (opportunity.derivedType !== filters.categoryFilter) {
          return false;
        }
      }

      if (filters.formatFilter) {
        if (filters.formatFilter === "In-person and Virtual") {
          if (opportunity.format !== "In-person and Virtual") return false;
        } else if (opportunity.format !== filters.formatFilter) {
          return false;
        }
      }

      if (filters.costFilter) {
        const costLower = opportunity.cost.toLowerCase();
        switch (filters.costFilter) {
          case "free":
            if (!costLower.includes("free")) return false;
            break;
          case "paid":
            if (!costLower.includes("$") && !costLower.includes("paid")) return false;
            break;
          case "unspecified":
            if (!costLower.includes("does not specify") && !costLower.includes("varies")) return false;
            break;
        }
      }

      if (filters.statusFilter && opportunity.status !== filters.statusFilter) {
        return false;
      }

      return true;
    });
  }, [enrichedOpportunities, filters]);

  const sortedOpportunities = useMemo(() => {
    return [...filteredOpportunities].sort((a, b) => {
      const typeIndexA = opportunityTypeOrder.indexOf(a.derivedType ?? "Mentorship & Learning");
      const typeIndexB = opportunityTypeOrder.indexOf(b.derivedType ?? "Mentorship & Learning");
      if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;

      const statusOrder = { "closing-soon": 1, open: 2, upcoming: 3, closed: 4 };
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 5;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 5;
      if (aStatus !== bStatus) return aStatus - bStatus;

      return a.title.localeCompare(b.title);
    });
  }, [filteredOpportunities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#2CA15F] dark:text-[#2CA15F]" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading opportunities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-[#19613F] dark:text-white mb-2">Error Loading Opportunities</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">{error}</p>
      </div>
    );
  }

  if (sortedOpportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 bg-[#19613F]/10 dark:bg-[#2CA15F]/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-[#19613F] dark:text-[#2CA15F]" />
        </div>
        <h3 className="text-lg font-semibold text-[#19613F] dark:text-white mb-2">No Opportunities Found</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">
          {opportunities.length === 0
            ? "There are currently no business opportunities available."
            : "No opportunities match your current filters. Try adjusting your search criteria."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200/60 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-emerald-600/40 dark:bg-[#11263b]/70 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Showing{" "}
          <span className="text-[#2CA15F] font-semibold">{sortedOpportunities.length}</span>{" "}
          of{" "}
          <span className="text-[#19613F] dark:text-[#2CA15F] font-semibold">{opportunities.length}</span>{" "}
          opportunities
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedOpportunities.map(({ derivedType: _derivedType, ...opportunity }) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            isFavourited={favourites.has(opportunity.id)}
            onFavourite={() => handleFavourite(opportunity.id)}
          />
        ))}
      </div>
    </div>
  );
}
