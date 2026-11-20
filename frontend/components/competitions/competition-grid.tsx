import { useEffect, useMemo, useState } from "react";
import { CompetitionCard } from "./competition-card";
import { Loader2, AlertCircle } from "lucide-react";
import { normalizeStatus, STATUS_ORDER } from "@/lib/utils/status";

interface Competition {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  gradeTags: string[];
  deadline: string;
  prize: string;
  status: string;
  description: string;
  applicationType: string;
  applyUrl: string;
  frequency: string;
  dates: [string, string];
  location: string;
  cost: string;
  registrationOpens?: string;
}

interface CompetitionGridProps {
  filters: {
    searchTerm: string;
    gradeFilter: string;
    statusFilter: string;
  };
}

// Helper object to map the filter dropdown values to the actual sheet tags
const gradeFilterMap: { [key: string]: string[] } = {
  all: [], // "all" is a special case for showing everything
  "Pre-Secondary": ["pre-secondary"], // Make sure you have a 'pre-secondary' tag in your sheet for these
  "9-10": ["grade 9", "grade 10"],
  "11-12": ["grade 11", "grade 12"],
  "9-12": ["grade 9", "grade 10", "grade 11", "grade 12"],
  "Post-Secondary": ["university", "college"],
};

export function CompetitionGrid({ filters }: CompetitionGridProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/competitions")
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setCompetitions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load competitions.");
        setLoading(false);
    });
  }, []);

  const normalizedCompetitions = useMemo(
    () =>
      competitions.map((competition) => ({
        ...competition,
        status: normalizeStatus(competition.status),
      })),
    [competitions],
  );

  const filteredCompetitions = normalizedCompetitions.filter((competition) => {
    // Search filter logic (unchanged)
    const matchesSearch =
      competition.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      competition.organizer.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesGrade = (() => {
      // If no filter is selected or 'all' is chosen, it's always a match
      if (!filters.gradeFilter || filters.gradeFilter === "all") {
        return true;
      }
      // Get the required tags for the current filter (e.g., ['grade 9', 'grade 10'])
      const requiredTags = gradeFilterMap[filters.gradeFilter];
      if (!requiredTags) {
        return true; // Failsafe for an unknown/unexpected filter value
      }
      // Ensure the competition object actually has the gradeTags array
      if (!competition.gradeTags || competition.gradeTags.length === 0) {
        return false; // Or `true` if you want to show items with no grade tags
      }
      // The core logic: checks if there's any overlap between the filter's tags and the competition's tags.
      return competition.gradeTags.some(tag => requiredTags.includes(tag));
    })();

    // Status filter logic (unchanged)
    const matchesStatus =
      !filters.statusFilter ||
      filters.statusFilter === "all" ||
      competition.status === filters.statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const sortedCompetitions = useMemo(() => {
    return [...filteredCompetitions].sort((a, b) => {
      const aStatus = STATUS_ORDER[a.status as keyof typeof STATUS_ORDER] || 4;
      const bStatus = STATUS_ORDER[b.status as keyof typeof STATUS_ORDER] || 4;
      if (aStatus !== bStatus) return aStatus - bStatus;

      return a.title.localeCompare(b.title);
    });
  }, [filteredCompetitions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-300" />
        <span className="mt-3 text-sm text-gray-600 dark:text-gray-300">Loading competitions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="mb-3 h-12 w-12 text-red-500" />
        <p className="text-lg font-semibold text-gray-800 dark:text-white">Error Loading Competitions</p>
        <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  if (sortedCompetitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-indigo-200/60 bg-white/80 py-16 text-center shadow-inner backdrop-blur dark:border-indigo-500/40 dark:bg-[#11263b]/70">
        <AlertCircle className="mb-4 h-12 w-12 text-indigo-500 dark:text-indigo-300" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No competitions found</h3>
        <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
          Try adjusting your filters to see more results or widen your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-indigo-200/60 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-indigo-500/40 dark:bg-[#11263b]/70 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Showing{" "}
          <span className="text-indigo-600 font-semibold dark:text-indigo-300">{sortedCompetitions.length}</span>{" "}
          competitions
        </p>
        <span className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
          Keep an eye on deadlines—many events fill up fast
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-6 lg:gap-8">
        {sortedCompetitions.map((competition) => (
          <CompetitionCard
            key={competition.id}
            competition={competition}
            // No favourites in public view
          />
        ))}
      </div>
    </div>
  );
}
