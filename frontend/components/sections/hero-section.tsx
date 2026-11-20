"use client";

import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Compass,
  Cpu,
  Loader2,
  Sparkles,
  Stethoscope,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { LogoWaterfall } from "@/components/animations/logo-waterfall";
import { OpportunityCard } from "@/components/business-opportunities/opportunity-card";
import {
  AnimatedElement,
  AnimatedText,
  FloatingElements,
  ParallaxElement,
} from "@/components/animations";
import { normalizeStatus } from "@/lib/utils/status";

interface ApiBusinessOpportunity {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  gradeTags?: string[];
  startDate: string;
  endDate: string;
  cost: string;
  format: string;
  status: string;
  description: string;
  applicationType?: string;
  applyUrl: string;
  category: string;
  opportunityType?: string[];
}

interface FeaturedOpportunityItem {
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
}

const OPEN_STATUSES = new Set(["open", "closing-soon"]);
const FEATURED_CENTER_CARDS = 3;
const MAX_FEATURED_ITEMS = 8;

const getSortTimestamp = (rawDate: string): number => {
  const date = new Date(rawDate);
  if (isNaN(date.getTime())) return Number.MAX_SAFE_INTEGER;
  return date.getTime();
};

const getOpportunityPriority = (item: FeaturedOpportunityItem): number => {
  const searchableText = `${item.title} ${item.category} ${(item.opportunityType || []).join(" ")}`.toLowerCase();
  const isInternshipOrJob =
    searchableText.includes("internship") || searchableText.includes("job");

  if (item.status === "open" && isInternshipOrJob) return 0;
  if (item.status === "open") return 1;
  if (item.status === "closing-soon" && isInternshipOrJob) return 2;
  return 3;
};

export function HeroSection() {
  const isCaseCompetitionSignupEnabled = false;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [featuredItems, setFeaturedItems] = useState<FeaturedOpportunityItem[]>(
    [],
  );
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    checkAuthStatus();
    loadFeaturedItems();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      setIsLoggedIn(response.data.success);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedItems = async () => {
    const sources = [
      "/api/business-opportunities",
      "/api/medicine-opportunities",
      "/api/engineering-opportunities",
    ] as const;

    try {
      setFeaturedLoading(true);
      const responses = await Promise.all(
        sources.map(async (sourceUrl) => {
          const response = await fetch(sourceUrl);
          if (!response.ok) {
            throw new Error(`Failed to load ${sourceUrl}`);
          }
          return response.json();
        }),
      );

      const normalizedItems = responses.flatMap((sourceData) => {
        if (!Array.isArray(sourceData)) return [];
        return (sourceData as ApiBusinessOpportunity[]).map((item) => ({
          id: item.id,
          title: item.title,
          organizer: item.organizer,
          logo: item.logo || "/logos/placeholder.svg",
          gradeTags: item.gradeTags || [],
          startDate: item.startDate,
          endDate: item.endDate,
          cost: item.cost || "TBD",
          format: item.format || "TBD",
          status: normalizeStatus(item.status),
          description: item.description,
          applicationType: item.applicationType || "external",
          applyUrl: item.applyUrl,
          category: item.category || "Opportunity",
          opportunityType: item.opportunityType || [],
        }));
      });

      const prioritizedItems = normalizedItems
        .filter(
          (item) => OPEN_STATUSES.has(item.status) && Boolean(item.applyUrl),
        )
        .sort((a, b) => {
          const priorityDiff = getOpportunityPriority(a) - getOpportunityPriority(b);
          if (priorityDiff !== 0) return priorityDiff;
          return getSortTimestamp(a.endDate) - getSortTimestamp(b.endDate);
        })
        .slice(0, MAX_FEATURED_ITEMS);

      setFeaturedItems(prioritizedItems);
      setFeaturedIndex(0);
      setFeaturedError(null);
    } catch (error) {
      console.error("Failed to load featured opportunities:", error);
      setFeaturedError(
        "Featured opportunities are unavailable right now. Please try again shortly.",
      );
    } finally {
      setFeaturedLoading(false);
    }
  };

  const goToPreviousFeatured = () => {
    if (featuredItems.length <= FEATURED_CENTER_CARDS) return;
    setFeaturedIndex(
      (currentIndex) =>
        (currentIndex - 1 + featuredItems.length) % featuredItems.length,
    );
  };

  const goToNextFeatured = () => {
    if (featuredItems.length <= FEATURED_CENTER_CARDS) return;
    setFeaturedIndex((currentIndex) => (currentIndex + 1) % featuredItems.length);
  };

  useEffect(() => {
    if (featuredItems.length <= FEATURED_CENTER_CARDS) return;
    const intervalId = window.setInterval(() => {
      setFeaturedIndex((currentIndex) => (currentIndex + 1) % featuredItems.length);
    }, 5500);

    return () => window.clearInterval(intervalId);
  }, [featuredItems.length]);

  const featuredCarouselCards = useMemo(() => {
    const total = featuredItems.length;
    if (total === 0) {
      return {
        leftPeek: null as FeaturedOpportunityItem | null,
        center: [] as FeaturedOpportunityItem[],
        rightPeek: null as FeaturedOpportunityItem | null,
      };
    }

    const getWrapped = (offset: number) =>
      featuredItems[(featuredIndex + offset + total) % total];

    const center = Array.from(
      { length: Math.min(FEATURED_CENTER_CARDS, total) },
      (_, offset) => getWrapped(offset),
    );

    return {
      leftPeek: total > FEATURED_CENTER_CARDS ? getWrapped(-1) : null,
      center,
      rightPeek:
        total > FEATURED_CENTER_CARDS ? getWrapped(FEATURED_CENTER_CARDS) : null,
    };
  }, [featuredIndex, featuredItems]);

  const hasCarouselControls = featuredItems.length > FEATURED_CENTER_CARDS;
  type CardTone = "emerald" | "sky" | "orange";

  const secondaryCtas: Array<{
    href: string;
    title: string;
    description: string;
    icon: typeof Briefcase;
    accent: string;
    tone: CardTone;
  }> = [
    {
      href: "/business-opportunities",
      title: "Business",
      description:
        "Internships, programs, and competitions tailored to ambitious students.",
      icon: Briefcase,
      accent: "Business Hub",
      tone: "emerald",
    },
    {
      href: "/medicine-opportunities",
      title: "Medicine",
      description:
        "Shadowing, research, and healthcare programs for future clinicians.",
      icon: Stethoscope,
      accent: "Medicine Hub",
      tone: "sky",
    },
    {
      href: "/engineering-opportunities",
      title: "Engineering",
      description:
        "STEM challenges, labs, and mentorships for builders and innovators.",
      icon: Cpu,
      accent: "Engineering Hub",
      tone: "orange",
    },
  ];

  const toneStyles = {
    emerald: {
      card: "border-emerald-200/60 bg-white/80 dark:border-emerald-500/30 dark:bg-[#11263b]/80",
      glow:
        "from-emerald-100/60 via-transparent to-emerald-200/70 dark:from-[#1d3f32]/60 dark:to-[#0f271d]/80",
      chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
      icon: "bg-emerald-100/70 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-900/50 dark:text-emerald-200 dark:group-hover:bg-emerald-600",
      title:
        "group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-200",
      link: "text-emerald-700 group-hover:text-emerald-800 dark:text-emerald-200 dark:group-hover:text-emerald-100",
    },
    sky: {
      card: "border-sky-200/70 bg-white/80 dark:border-sky-500/30 dark:bg-[#11263b]/80",
      glow:
        "from-sky-100/70 via-transparent to-sky-200/80 dark:from-sky-900/40 dark:to-sky-950/70",
      chip: "bg-sky-50 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200",
      icon: "bg-sky-100/70 text-sky-700 group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-900/50 dark:text-sky-200 dark:group-hover:bg-sky-600",
      title:
        "group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-200",
      link: "text-sky-700 group-hover:text-sky-800 dark:text-sky-200 dark:group-hover:text-sky-100",
    },
    orange: {
      card: "border-orange-200/70 bg-white/80 dark:border-orange-500/30 dark:bg-[#11263b]/80",
      glow:
        "from-orange-100/70 via-transparent to-orange-200/80 dark:from-orange-900/40 dark:to-orange-950/70",
      chip: "bg-orange-50 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200",
      icon: "bg-orange-100/70 text-orange-700 group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-900/50 dark:text-orange-200 dark:group-hover:bg-orange-600",
      title:
        "group-hover:text-orange-700 dark:text-white dark:group-hover:text-orange-200",
      link: "text-orange-700 group-hover:text-orange-800 dark:text-orange-200 dark:group-hover:text-orange-100",
    },
  } as const;

  return (
    <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#D9D9D9] via-white to-[#D9D9D9] dark:from-[#0c1a2e] dark:via-[#102338] dark:to-[#152a45] dark:text-white relative overflow-hidden">
      <LogoWaterfall />
      <FloatingElements count={12} />
      <ParallaxElement speed={0.2} className="absolute inset-0">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center mix-blend-overlay"></div>
      </ParallaxElement>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center animate-fade-in">
          <AnimatedElement animation="slideUp" delay={0.2}>
            <div className="flex flex-col items-center text-4xl sm:text-6xl font-bold font-serif text-black mb-6 dark:text-card-foreground">
              <AnimatedText
                text="The Ultimate Platform for"
                animation="letterByLetter"
                staggerChildren={0.02}
              />
              <div className="-mt-2 sm:-mt-3">
                <AnimatedText
                  text="Canadian High School Opportunities"
                  className="gradient-text inline-block"
                  animation="wordByWord"
                  staggerChildren={0.1}
                  delay={1.2}
                />
              </div>
            </div>
          </AnimatedElement>
          <AnimatedElement animation="fadeIn" delay={1.8}>
            <p className="text-xl text-black mb-8 max-w-3xl mx-auto dark:text-gray-300">
              Discover curated business, medicine, and engineering
              opportunities. Track deadlines, apply faster, and build your
              resume with one profile.
            </p>
          </AnimatedElement>

          <AnimatedElement animation="slideUp" delay={2.2}>
            <div className="flex flex-col items-center gap-4 justify-center mb-16">
              <div
                className={`grid w-full max-w-5xl grid-cols-1 items-stretch justify-items-center gap-4 ${
                  isCaseCompetitionSignupEnabled ? "lg:grid-cols-2" : "lg:grid-cols-1"
                }`}
              >
                {/* Quiz button */}
                <div className="relative group w-full max-w-[520px]">
                  <div className="pointer-events-none absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-500/50 via-purple-500/50 to-indigo-500/50 blur-sm opacity-45 transition duration-500 group-hover:opacity-70"></div>
                  <Button
                    asChild
                    size="lg"
                    className="relative z-10 h-full min-h-[84px] w-full text-lg px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 font-semibold transition-all duration-200 shadow-[0_10px_25px_-15px_rgba(0,0,0,0.6)]"
                  >
                    <Link href="/findyouropp">
                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
                          <p className="text-lg sm:text-xl">Find Your Perfect Opportunity</p>
                        </div>
                        <p className="text-[11px] font-normal mt-1 opacity-80">
                          Take our 30-second quiz!
                        </p>
                      </div>
                    </Link>
                  </Button>
                </div>

                {/* - */}
                {isCaseCompetitionSignupEnabled && (
                  <div className="relative group w-full max-w-[520px]">
                    <div className="pointer-events-none absolute -inset-0.5 rounded-lg bg-gradient-to-r from-[#1E7D4B]/60 via-[#1F9D5A]/60 to-[#2CA15F]/60 blur-sm opacity-45 transition duration-500 group-hover:opacity-70" />
                    <Button
                      asChild
                      size="lg"
                      className="relative z-10 h-full min-h-[84px] w-full text-lg px-3 py-3 bg-gradient-to-r from-[#19613F] via-[#1F8A52] to-[#2CA15F] text-white font-semibold shadow-[0_14px_28px_-18px_rgba(25,97,63,0.8)] transition-transform duration-200 hover:scale-[1.01]"
                    >
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfBqDSxPHuirfaeGgqFXIAyQFN0Nc3h-loKr0fs9PUPruFy8g/viewform"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div className="text-center">
                          <p className="text-lg sm:text-xl">Sign up for TPD&apos;s Case Competition</p>
                          <p className="text-[11px] font-normal mt-1 text-white/90">
                            <span className="block">
                              Win Prizes, Coffee Chats with Judges from Ivey and CIBC,
                            </span>
                            <span className="block">
                              and exclusive future oppurtuntities!
                            </span>
                          </p>
                        </div>
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Dashboard Link for Authenticated Users */}
              {!loading && isLoggedIn && (
                <div className="mt-4 flex justify-center">
                  <Link href="/dashboard/general">
                    <Button
                      size="lg"
                      className="bg-[#19613F] hover:bg-[#2CA15F] text-white transition-all duration-200"
                    >
                      <Trophy className="h-5 w-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              )}

              {/* Elevated secondary calls-to-action */}
              <div className="mt-8 grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {secondaryCtas.map(
                  ({ href, title, description, icon: Icon, accent, tone }) => {
                    const styles = toneStyles[tone];
                    return (
                      <Link key={href} href={href} className="group">
                        <motion.div
                          whileHover={{ y: -6, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`relative h-full overflow-hidden rounded-2xl border p-6 shadow-[0_25px_60px_-30px_rgba(27,94,52,0.6)] backdrop-blur ${styles.card}`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${styles.glow}`}
                          />
                          <div className="relative flex h-full flex-col gap-4">
                            <div className="flex items-center justify-between gap-3">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${styles.chip}`}
                              >
                                <Compass className="h-4 w-4" />
                                {accent}
                              </span>
                              <span
                                className={`rounded-full p-3 shadow-inner transition ${styles.icon}`}
                              >
                                <Icon className="h-6 w-6" />
                              </span>
                            </div>
                            <div className="space-y-2">
                              <h3
                                className={`text-xl font-semibold text-gray-900 transition-colors ${styles.title}`}
                              >
                                {title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {description}
                              </p>
                            </div>
                            <div
                              className={`mt-auto flex items-center gap-2 pt-1 text-sm font-semibold transition group-hover:gap-3 ${styles.link}`}
                            >
                              Start exploring
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  },
                )}
              </div>

              <div className="relative mt-14 self-stretch">
                <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 lg:px-10">
                  <div className="relative overflow-hidden border-y border-emerald-300/60 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/90 py-8 shadow-[0_26px_75px_-48px_rgba(16,74,48,0.55)] dark:border-emerald-600/40 dark:from-[#0f2236]/95 dark:via-[#11263b]/90 dark:to-[#0f2236]/95 sm:rounded-[30px] sm:border sm:py-10">
                    <div className="pointer-events-none absolute -left-16 top-4 h-52 w-52 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/15" />
                    <div className="pointer-events-none absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl dark:bg-cyan-500/10" />
                    <div className="relative mx-auto w-full max-w-[1400px] px-2 sm:px-4 lg:px-6">
                      <div className="flex flex-wrap items-end justify-between gap-5">
                        <div className="text-left">
                          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                            Featured Opportunities
                          </h3>
                      <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                        Handpicked open listings with internship and job opportunities shown first.
                      </p>
                    </div>
                  </div>

                      {featuredLoading && (
                        <div className="mt-8 flex items-center justify-center rounded-2xl border border-emerald-200/60 bg-white/90 p-10 dark:border-emerald-600/40 dark:bg-[#0f1f2d]/80">
                          <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-300" />
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                            Loading featured opportunities...
                          </span>
                        </div>
                      )}

                      {!featuredLoading && featuredError && (
                        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-rose-200/70 bg-rose-50/80 p-10 text-center dark:border-rose-700/50 dark:bg-rose-900/20">
                          <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-300" />
                          <p className="mt-2 text-sm text-rose-700 dark:text-rose-200">
                            {featuredError}
                          </p>
                        </div>
                      )}

                      {!featuredLoading &&
                        !featuredError &&
                        featuredItems.length === 0 && (
                          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-10 text-center dark:border-emerald-600/50 dark:bg-emerald-900/20">
                            <AlertCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                              There are no open opportunities right now.
                            </p>
                          </div>
                        )}

                      {!featuredLoading &&
                        !featuredError &&
                        featuredItems.length > 0 && (
                          <div className="relative mt-8 rounded-3xl border border-emerald-200/60 bg-white/60 p-3 shadow-inner dark:border-emerald-700/40 dark:bg-[#0f1f2d]/55 sm:p-4 lg:p-5">
                            {hasCarouselControls && (
                              <>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  className="absolute -left-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-emerald-200/90 bg-white/95 text-emerald-700 shadow-xl hover:bg-emerald-50 dark:border-emerald-600/60 dark:bg-[#102338] dark:text-emerald-200 dark:hover:bg-emerald-900/40 xl:flex"
                                  onClick={goToPreviousFeatured}
                                  aria-label="Previous featured opportunities"
                                >
                                  <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  className="absolute -right-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-emerald-200/90 bg-white/95 text-emerald-700 shadow-xl hover:bg-emerald-50 dark:border-emerald-600/60 dark:bg-[#102338] dark:text-emerald-200 dark:hover:bg-emerald-900/40 xl:flex"
                                  onClick={goToNextFeatured}
                                  aria-label="Next featured opportunities"
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </Button>
                              </>
                            )}

                            <motion.div
                              key={featuredIndex}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                              className="flex items-stretch gap-4 lg:gap-5"
                            >
                              {featuredCarouselCards.leftPeek && (
                                <div className="hidden xl:block xl:w-[14%] xl:min-w-[170px] xl:opacity-50 xl:scale-[0.92] pointer-events-none">
                                  <OpportunityCard
                                    opportunity={featuredCarouselCards.leftPeek}
                                    isFavourited={false}
                                    onFavourite={() => {}}
                                  />
                                </div>
                              )}

                              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-5">
                                {featuredCarouselCards.center.map((opportunity) => (
                                  <OpportunityCard
                                    key={`${opportunity.id}-${featuredIndex}`}
                                    opportunity={opportunity}
                                    isFavourited={false}
                                    onFavourite={() => {}}
                                  />
                                ))}
                              </div>

                              {featuredCarouselCards.rightPeek && (
                                <div className="hidden xl:block xl:w-[14%] xl:min-w-[170px] xl:opacity-50 xl:scale-[0.92] pointer-events-none">
                                  <OpportunityCard
                                    opportunity={featuredCarouselCards.rightPeek}
                                    isFavourited={false}
                                    onFavourite={() => {}}
                                  />
                                </div>
                              )}
                            </motion.div>
                          </div>
                        )}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedElement>


        </div>
      </div>
    </section>
  );
}
