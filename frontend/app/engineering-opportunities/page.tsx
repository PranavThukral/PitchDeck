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
import { AlertCircle, ChevronDown, Loader2, Sparkles } from "lucide-react";
import {
  deriveOpportunityType,
  OPPORTUNITY_TYPE_ORDER,
  type OpportunityType,
} from "@/lib/constants/opportunity-types";
import { normalizeStatus, STATUS_ORDER } from "@/lib/utils/status";

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

export default function EngineeringOpportunitiesPage() {
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
        const response = await fetch("/api/engineering-opportunities");
        if (!response.ok) {
          throw new Error("Failed to load opportunities");
        }
        const data = await response.json();
        setOpportunities(data);
        setOpportunitiesError(null);
      } catch (error) {
        console.error("Error loading engineering opportunities:", error);
        setOpportunitiesError(
          "Failed to load engineering opportunities. Please try again later.",
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
        const response = await fetch("/api/engineering-competitions");
        if (!response.ok) {
          throw new Error("Failed to load competitions");
        }
        const data = await response.json();
        setCompetitions(data);
        setCompetitionsError(null);
      } catch (error) {
        console.error("Error loading engineering competitions:", error);
        setCompetitionsError(
          "Failed to load engineering competitions. Please try again later.",
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
      const aStatus = STATUS_ORDER[a.status as keyof typeof STATUS_ORDER] || 5;
      const bStatus = STATUS_ORDER[b.status as keyof typeof STATUS_ORDER] || 5;
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
      const aStatus = STATUS_ORDER[a.status as keyof typeof STATUS_ORDER] || 5;
      const bStatus = STATUS_ORDER[b.status as keyof typeof STATUS_ORDER] || 5;
      if (aStatus !== bStatus) return aStatus - bStatus;
      return a.title.localeCompare(b.title);
    });
  }, [normalizedCompetitions]);

  const opportunitiesCanExpand = sortedOpportunities.length > 4;
  const competitionsCanExpand = sortedCompetitions.length > 4;

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Engineering Opportunities", url: "/engineering-opportunities" },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#fff6ed] via-white to-[#fff1e2] dark:from-[#0c1a2e] dark:via-[#102338] dark:to-[#193252]">
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <Navigation />

      <main className="relative flex-1 overflow-hidden pt-24 pb-20 px-2 sm:px-3 lg:px-5">
        <div className="absolute inset-0 pointer-events-none">
          <LogoWaterfall />
          <FloatingElements count={12} color="rgba(234, 88, 12, 0.12)" />
          <ParallaxElement speed={0.15} className="absolute inset-0">
            <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center" />
          </ParallaxElement>
          <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-transparent to-orange-100/40 dark:from-[#0f2236]/70 dark:via-transparent dark:to-[#071420]/75" />
          <div className="absolute -top-28 right-16 h-60 w-60 rounded-full bg-orange-200/50 blur-[120px] dark:bg-orange-500/15" />
          <div className="absolute bottom-[-7rem] left-[-5rem] h-80 w-80 rounded-full bg-amber-200/40 blur-[120px] dark:bg-amber-500/10" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[95rem] flex-col gap-12">
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-orange-700 shadow-sm dark:bg-orange-900/60 dark:text-orange-200">
              <Sparkles className="h-4 w-4" />
              Engineering Opportunity Hub
            </span>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
              Engineering Opportunities
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              Explore STEM programs, design labs, and engineering competitions
              built for builders and innovators.
            </p>
          </motion.header>

          <div className="space-y-10">
            <motion.section
              id="engineering-opportunities"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
              className="scroll-mt-28"
            >
              <div className="rounded-3xl border border-orange-200/60 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-orange-500/40 dark:bg-[#11263b]/70">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Engineering Opportunities
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Internships, labs, and mentorships for future engineers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      opportunitiesCanExpand &&
                      setOpportunitiesExpanded((prev) => !prev)
                    }
                    aria-expanded={opportunitiesExpanded}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-orange-200/60 bg-white/90 text-orange-700 shadow-sm transition hover:bg-orange-50 dark:border-orange-500/40 dark:bg-[#0f2032] dark:text-orange-200 ${
                      opportunitiesCanExpand ? "" : "cursor-default opacity-50"
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
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
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
                        <AlertCircle className="mb-3 h-12 w-12 text-orange-500" />
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          No opportunities available yet
                        </p>
                        <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
                          Check back soon for new engineering opportunities.
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
                    className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-200 dark:hover:bg-orange-900/40"
                  >
                    {opportunitiesExpanded ? "Show less" : "See more"}
                  </Button>
                </div>
              </div>
            </motion.section>

            <motion.section
              id="engineering-competitions"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="scroll-mt-28"
            >
              <div className="rounded-3xl border border-amber-200/60 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-amber-500/40 dark:bg-[#11263b]/70">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Engineering Competitions
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Design challenges, hackathons, and showcases for technical
                      builders.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      competitionsCanExpand &&
                      setCompetitionsExpanded((prev) => !prev)
                    }
                    aria-expanded={competitionsExpanded}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/60 bg-white/90 text-amber-700 shadow-sm transition hover:bg-amber-50 dark:border-amber-500/40 dark:bg-[#0f2032] dark:text-amber-200 ${
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
                      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
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
                        <AlertCircle className="mb-3 h-12 w-12 text-amber-500" />
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          No competitions available yet
                        </p>
                        <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
                          Check back soon for new engineering competitions.
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
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-200 dark:hover:bg-amber-900/40"
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
