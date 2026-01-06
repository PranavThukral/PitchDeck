"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CompetitionFilters } from "@/components/competitions/competition-filters";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { CompetitionGrid } from "@/components/competitions/competition-grid";
import { BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { FloatingElements, ParallaxElement } from "@/components/animations";
import { LogoWaterfall } from "@/components/animations/logo-waterfall";
import { Sparkles } from "lucide-react";

export default function CompetitionsPage() {
  const [filters, setFilters] = useState({
    searchTerm: "",
    gradeFilter: "",
    statusFilter: "",
  });

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Competitions", url: "/competitions" },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#f6f5ff] via-white to-[#e9efff] dark:from-[#0c1a2e] dark:via-[#102338] dark:to-[#193252]">
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <Navigation />

      <main className="relative flex-1 overflow-hidden pt-24 pb-20 px-2 sm:px-3 lg:px-5">
        <div className="absolute inset-0 pointer-events-none">
          <LogoWaterfall />
          <FloatingElements count={12} color="rgba(60, 102, 219, 0.12)" />
          <ParallaxElement speed={0.15} className="absolute inset-0">
            <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center" />
          </ParallaxElement>
          <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-transparent to-indigo-100/40 dark:from-[#0f2236]/70 dark:via-transparent dark:to-[#071420]/75" />
          <div className="absolute -top-28 right-16 h-60 w-60 rounded-full bg-indigo-200/50 blur-[120px] dark:bg-indigo-500/15" />
          <div className="absolute bottom-[-7rem] left-[-5rem] h-80 w-80 rounded-full bg-sky-200/40 blur-[120px] dark:bg-sky-500/10" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col gap-12">
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 shadow-sm dark:bg-indigo-900/60 dark:text-indigo-200">
              <Sparkles className="h-4 w-4" />
              Case Competition Hub
            </span>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
              Case Competitions
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              Discover and apply to the competitions that challenge your thinking, sharpen your pitch, and open doors across the globe.
            </p>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="space-y-8"
          >
            <CompetitionFilters onFiltersChange={setFilters} />
            <CompetitionGrid filters={filters} />
          </motion.section>
        </div>
      </main>

      <Footer className="mt-auto" />
    </div>
  );
}

