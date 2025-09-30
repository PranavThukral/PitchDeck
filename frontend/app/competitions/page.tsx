"use client";

import { useState } from "react";
import { CompetitionFilters } from "@/components/competitions/competition-filters";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { CompetitionGrid } from "@/components/competitions/competition-grid";
import { BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Competitions - Find Your Next Challenge | The Pitch Deck",
  description:
    "Browse hundreds of case competitions from top universities and organizations worldwide. Filter by grade level, industry, and application deadlines.",
  keywords:
    "case competitions, business competitions, university competitions, consulting competitions, MBA competitions, undergraduate competitions, competition directory, business case challenges",
  openGraph: {
    title: "Case Competitions - Find Your Next Challenge | The Pitch Deck",
    description:
      "Browse hundreds of case competitions from top universities and organizations worldwide. Filter by grade level, industry, and application deadlines.",
    type: "website",
    url: "/competitions",
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Competitions - Find Your Next Challenge | The Pitch Deck",
    description:
      "Browse hundreds of case competitions from top universities and organizations worldwide. Filter by grade level, industry, and application deadlines.",
  },
};

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
    <div className="min-h-screen flex flex-col">
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <Navigation />
      <div className="flex-1 pt-20 pb-16 px-4 sm:px-6 lg:px-8 w-full bg-[#D9D9D9] dark:bg-gradient-to-br dark:from-[#102338] dark:via-[#152a45] dark:to-[#193252]">
        <div className="w-full mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Case Competitions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover and apply to business case competitions from top
              institutions around the world.
            </p>
          </div>

          <CompetitionFilters onFiltersChange={setFilters} />
          <CompetitionGrid filters={filters} />
        </div>
      </div>
      <Footer className="mt-auto" />
    </div>
  );
}
