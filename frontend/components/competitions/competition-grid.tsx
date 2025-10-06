import { useEffect, useState } from "react";
import { CompetitionCard } from "./competition-card";

// 1. UPDATED INTERFACE to use gradeTags and match the new data structure
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

  const filteredCompetitions = competitions.filter((competition) => {
    // Search filter logic (unchanged)
    const matchesSearch =
      competition.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      competition.organizer.toLowerCase().includes(filters.searchTerm.toLowerCase());

    // 2. IMPLEMENTED the correct and functional grade filtering logic
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

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500 w-full h-[70vh] flex items-center justify-center">
        Loading competitions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 w-full h-[70vh] flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (filteredCompetitions.length === 0) {
    return (
      <div className="text-center py-12 w-full h-[70vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg">
          No competitions found matching your criteria.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full max-w-screen-2xl mx-auto px-2 sm:px-0 mt-0">
      {filteredCompetitions.map((competition) => (
        <CompetitionCard
          key={competition.id}
          competition={competition}
          // No favourites in public view
        />
      ))}
    </div>
  );
}
