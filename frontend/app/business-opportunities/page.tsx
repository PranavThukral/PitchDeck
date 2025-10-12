"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  OpportunityFilters,
  type OpportunityFilterState,
} from "@/components/business-opportunities/opportunity-filters";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { OpportunityGrid } from "@/components/business-opportunities/opportunity-grid";
import { BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { FloatingElements, ParallaxElement } from "@/components/animations";
import { LogoWaterfall } from "@/components/animations/logo-waterfall";
import { Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { matchOpportunityType } from "@/lib/constants/opportunity-types";
import { FiltersShell } from "./_components/filters-shell";

const emptyFilters: OpportunityFilterState = {
  searchTerm: "",
  categoryFilter: "",
  formatFilter: "",
  costFilter: "",
  statusFilter: "",
};

export default function BusinessOpportunitiesPage() {
  return (
    <Suspense fallback={null}>
      <BusinessOpportunitiesContent />
    </Suspense>
  );
}

function BusinessOpportunitiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialFilters = useMemo<OpportunityFilterState>(() => {
    if (!searchParams) return emptyFilters;

    const typeParam = searchParams.get("type");
    return {
      searchTerm: searchParams.get("q") ?? "",
      categoryFilter: matchOpportunityType(typeParam ?? "") ?? "",
      formatFilter: searchParams.get("format") ?? "",
      costFilter: searchParams.get("cost") ?? "",
      statusFilter: searchParams.get("status") ?? "",
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<OpportunityFilterState>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleFiltersChange = useCallback(
    (nextFilters: OpportunityFilterState) => {
      setFilters(nextFilters);

      const params = new URLSearchParams();
      if (nextFilters.categoryFilter) params.set("type", nextFilters.categoryFilter);
      if (nextFilters.formatFilter) params.set("format", nextFilters.formatFilter);
      if (nextFilters.costFilter) params.set("cost", nextFilters.costFilter);
      if (nextFilters.statusFilter) params.set("status", nextFilters.statusFilter);
      if (nextFilters.searchTerm) params.set("q", nextFilters.searchTerm);

      const queryString = params.toString();
      router.replace(
        `/business-opportunities${queryString ? `?${queryString}` : ""}`,
        { scroll: false },
      );
    },
    [router],
  );

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Business Opportunities", url: "/business-opportunities" },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#f3f8f6] via-white to-[#e6f4eb] dark:from-[#0c1a2e] dark:via-[#102338] dark:to-[#193252]">
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <Navigation />

      <main className="relative flex-1 overflow-hidden pt-24 pb-20 px-4 sm:px-6 lg:px-8">
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

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12">
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
              Explore curated programs, internships, fellowships, and leadership experiences designed to accelerate your career and{" "}
              <span className="text-emerald-600 font-semibold dark:text-emerald-300">entrepreneurial journey</span>.
            </p>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="space-y-8"
          >
            <FiltersShell>
              <OpportunityFilters filters={filters} onFiltersChange={handleFiltersChange} />
            </FiltersShell>
            <OpportunityGrid filters={filters} />
          </motion.section>
        </div>
      </main>

      <Footer className="mt-auto" />
    </div>
  );
}
