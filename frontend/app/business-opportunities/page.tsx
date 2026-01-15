"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { FloatingElements, ParallaxElement } from "@/components/animations";
import { LogoWaterfall } from "@/components/animations/logo-waterfall";
import { OpportunityCard } from "@/components/business-opportunities/opportunity-card";
import { CompetitionCard } from "@/components/competitions/competition-card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  deriveOpportunityType,
  OPPORTUNITY_TYPE_ORDER,
  type OpportunityType,
} from "@/lib/constants/opportunity-types";

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

const normalizeStatus = (rawStatus: string | undefined): string => {
  const cleaned = (rawStatus || "")
    .replace(/[\[\]"']/g, "")
    .trim()
    .toLowerCase();

  if (["open", "closed", "upcoming", "closing-soon"].includes(cleaned))
    return cleaned;
  if (cleaned.includes("close")) return "closed";
  if (cleaned.includes("open")) return "open";
  if (cleaned.includes("upcoming")) return "upcoming";
  if (cleaned.includes("closing")) return "closing-soon";
  return "open";
};

const statusOrder = {
  upcoming: 1,
  open: 2,
  "closing-soon": 2,
  closed: 3,
};

export default function BusinessOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<BusinessOpportunity[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(
    null,
  );
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [competitionsLoading, setCompetitionsLoading] = useState(true);
  const [competitionsError, setCompetitionsError] = useState<string | null>(
    null,
  );
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [opportunitiesExpanded, setOpportunitiesExpanded] = useState(false);
  const [competitionsExpanded, setCompetitionsExpanded] = useState(false);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setOpportunitiesLoading(true);
        const response = await fetch("/api/business-opportunities");
        if (!response.ok) {
          throw new Error("Failed to load opportunities");
        }
        const data = await response.json();
        setOpportunities(data);
        setOpportunitiesError(null);
      } catch (error) {
        console.error("Error loading opportunities:", error);
        setOpportunitiesError(
          "Failed to load business opportunities. Please try again later.",
        );
      } finally {
        setOpportunitiesLoading(false);
      }
    };
    loadOpportunities();
  }, []);

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        setCompetitionsLoading(true);
        const response = await fetch("/api/competitions");
        if (!response.ok) {
          throw new Error("Failed to load competitions");
        }
        const data = await response.json();
        setCompetitions(data);
        setCompetitionsError(null);
      } catch (error) {
        console.error("Error loading competitions:", error);
        setCompetitionsError(
          "Failed to load business competitions. Please try again later.",
        );
      } finally {
        setCompetitionsLoading(false);
      }
    };
    loadCompetitions();
  }, []);

  useEffect(() => {
    const savedFavourites = localStorage.getItem("favourite-opportunities");
    if (savedFavourites) {
      try {
        const favouriteIds = JSON.parse(savedFavourites);
        setFavourites(new Set(favouriteIds));
      } catch (error) {
        console.error("Error loading favourites:", error);
      }
    }
  }, []);

  const saveFavourites = (nextFavourites: Set<string>) => {
    localStorage.setItem(
      "favourite-opportunities",
      JSON.stringify(Array.from(nextFavourites)),
    );
    setFavourites(nextFavourites);
  };

  const handleFavourite = (opportunityId: string) => {
    const nextFavourites = new Set(favourites);
    if (nextFavourites.has(opportunityId)) {
      nextFavourites.delete(opportunityId);
    } else {
      nextFavourites.add(opportunityId);
    }
    saveFavourites(nextFavourites);
  };

  const enrichedOpportunities = useMemo(() => {
    return opportunities.map((opportunity) => ({
      ...opportunity,
      status: normalizeStatus(opportunity.status),
      derivedType: deriveOpportunityType({
        opportunityType: opportunity.opportunityType,
        category: opportunity.category,
        title: opportunity.title,
        description: opportunity.description,
      }),
    }));
  }, [opportunities]);

  const sortedOpportunities = useMemo(() => {
    return [...enrichedOpportunities].sort((a, b) => {
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 5;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 5;
      if (aStatus !== bStatus) return aStatus - bStatus;

      const typeIndexA = OPPORTUNITY_TYPE_ORDER.indexOf(
        a.derivedType ?? "Mentorship & Learning",
      );
      const typeIndexB = OPPORTUNITY_TYPE_ORDER.indexOf(
        b.derivedType ?? "Mentorship & Learning",
      );
      if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;

      return a.title.localeCompare(b.title);
    });
  }, [enrichedOpportunities]);

  const normalizedCompetitions = useMemo(
    () =>
      competitions.map((competition) => ({
        ...competition,
        status: normalizeStatus(competition.status),
      })),
    [competitions],
  );

  const sortedCompetitions = useMemo(() => {
    return [...normalizedCompetitions].sort((a, b) => {
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 5;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 5;
      if (aStatus !== bStatus) return aStatus - bStatus;
      return a.title.localeCompare(b.title);
    });
  }, [normalizedCompetitions]);

  const opportunitiesCanExpand = sortedOpportunities.length > 4;
  const competitionsCanExpand = sortedCompetitions.length > 4;

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Business Opportunities", url: "/business-opportunities" },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#f3f8f6] via-white to-[#e6f4eb] dark:from-[#0c1a2e] dark:via-[#102338] dark:to-[#193252]">
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <Navigation />

      <main className="relative flex-1 overflow-hidden pt-24 pb-20 px-1 sm:px-2 lg:px-4">
        <div className="absolute inset-0 pointer-events-none">
          <LogoWaterfall />
          <FloatingElements count={14} color="rgba(34, 120, 82, 0.12)" />
          <ParallaxElement speed={0.14} className="absolute inset-0">
            <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center" />
          </ParallaxElement>
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-emerald-100/35 dark:from-[#0f2236]/70 dark:via-transparent dark:to-[#071420]/75" />
          <div className="absolute -top-32 right-12 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
          <div className="absolute bottom-[-6rem] left-[-4rem] h-80 w-80 rounded-full bg-lime-200/35 blur-3xl dark:bg-emerald-400/10" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[100rem] flex-col gap-12">
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 shadow-sm dark:bg-emerald-900/60 dark:text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Opportunity Directory
            </span>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
              Business Opportunities
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              Explore curated programs, internships, and business competitions
              that accelerate your{" "}
              <span className="text-emerald-600 font-semibold dark:text-emerald-300">
                entrepreneurial journey
              </span>
              .
            </p>
          </motion.header>

          <div className="space-y-10">
            <motion.section
              id="business-opportunities"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
              className="scroll-mt-28"
            >
              <div className="rounded-3xl border border-emerald-200/60 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-emerald-600/40 dark:bg-[#11263b]/70">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Business Opportunities
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Programs, internships, and leadership roles curated for
                      ambitious students.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      opportunitiesCanExpand &&
                      setOpportunitiesExpanded((prev) => !prev)
                    }
                    aria-expanded={opportunitiesExpanded}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200/60 bg-white/90 text-emerald-700 shadow-sm transition hover:bg-emerald-50 dark:border-emerald-500/40 dark:bg-[#0f2032] dark:text-emerald-200 ${
                      opportunitiesCanExpand
                        ? ""
                        : "cursor-default opacity-50"
                    }`}
                  >
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-300 ${
                        opportunitiesExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <div
                  className={`relative mt-6 transition-[max-height] duration-500 ${
                    opportunitiesExpanded
                      ? "max-h-[5000px]"
                      : "max-h-[520px] overflow-hidden"
                  }`}
                >
                  {opportunitiesLoading && (
                    <div className="flex items-center justify-center py-16 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                        Loading opportunities...
                      </span>
                    </div>
                  )}

                  {!opportunitiesLoading && opportunitiesError && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <AlertCircle className="mb-3 h-12 w-12 text-red-500" />
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        Error Loading Opportunities
                      </p>
                      <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
                        {opportunitiesError}
                      </p>
                    </div>
                  )}

                  {!opportunitiesLoading &&
                    !opportunitiesError &&
                    sortedOpportunities.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="mb-3 h-12 w-12 text-emerald-500" />
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          No opportunities available yet
                        </p>
                        <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
                          Check back soon for new business opportunities.
                        </p>
                      </div>
                    )}

                  {!opportunitiesLoading &&
                    !opportunitiesError &&
                    sortedOpportunities.length > 0 && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-6 lg:gap-8">
                        {sortedOpportunities.map(
                          ({ derivedType: _derivedType, ...opportunity }) => (
                            <OpportunityCard
                              key={opportunity.id}
                              opportunity={opportunity}
                              isFavourited={favourites.has(opportunity.id)}
                              onFavourite={() =>
                                handleFavourite(opportunity.id)
                              }
                            />
                          ),
                        )}
                      </div>
                    )}

                  {!opportunitiesExpanded && opportunitiesCanExpand && (
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-[#11263b] dark:via-[#11263b]/70" />
                  )}
                </div>

                <div className="mt-6 flex justify-start">
                  <Button
                    variant="outline"
                    onClick={() =>
                      opportunitiesCanExpand &&
                      setOpportunitiesExpanded((prev) => !prev)
                    }
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                  >
                    {opportunitiesExpanded ? "Show less" : "See more"}
                  </Button>
                </div>
              </div>
            </motion.section>

            <motion.section
              id="business-competitions"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="scroll-mt-28"
            >
              <div className="rounded-3xl border border-indigo-200/60 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-indigo-500/40 dark:bg-[#11263b]/70">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Business Competitions
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Case challenges and pitch competitions to sharpen your
                      skills.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      competitionsCanExpand &&
                      setCompetitionsExpanded((prev) => !prev)
                    }
                    aria-expanded={competitionsExpanded}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-200/60 bg-white/90 text-indigo-700 shadow-sm transition hover:bg-indigo-50 dark:border-indigo-500/40 dark:bg-[#0f2032] dark:text-indigo-200 ${
                      competitionsCanExpand ? "" : "cursor-default opacity-50"
                    }`}
                  >
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-300 ${
                        competitionsExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <div
                  className={`relative mt-6 transition-[max-height] duration-500 ${
                    competitionsExpanded
                      ? "max-h-[5000px]"
                      : "max-h-[500px] overflow-hidden"
                  }`}
                >
                  {competitionsLoading && (
                    <div className="flex items-center justify-center py-16 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                        Loading competitions...
                      </span>
                    </div>
                  )}

                  {!competitionsLoading && competitionsError && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <AlertCircle className="mb-3 h-12 w-12 text-red-500" />
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        Error Loading Competitions
                      </p>
                      <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
                        {competitionsError}
                      </p>
                    </div>
                  )}

                  {!competitionsLoading &&
                    !competitionsError &&
                    sortedCompetitions.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="mb-3 h-12 w-12 text-indigo-500" />
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          No competitions available yet
                        </p>
                        <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
                          Check back soon for new competitions.
                        </p>
                      </div>
                    )}

                  {!competitionsLoading &&
                    !competitionsError &&
                    sortedCompetitions.length > 0 && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-6 lg:gap-8">
                        {sortedCompetitions.map((competition) => (
                          <CompetitionCard
                            key={competition.id}
                            competition={competition}
                          />
                        ))}
                      </div>
                    )}

                  {!competitionsExpanded && competitionsCanExpand && (
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-[#11263b] dark:via-[#11263b]/70" />
                  )}
                </div>

                <div className="mt-6 flex justify-start">
                  <Button
                    variant="outline"
                    onClick={() =>
                      competitionsCanExpand &&
                      setCompetitionsExpanded((prev) => !prev)
                    }
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-200 dark:hover:bg-indigo-900/40"
                  >
                    {competitionsExpanded ? "Show less" : "See more"}
                  </Button>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      <Footer className="mt-auto" />
    </div>
  );
}
