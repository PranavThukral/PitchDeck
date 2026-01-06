"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Trophy,
  Sparkles,
  Briefcase,
  Compass,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { LogoWaterfall } from "@/components/animations/logo-waterfall";
import {
  AnimatedElement,
  AnimatedText,
  FloatingElements,
  ParallaxElement,
} from "@/components/animations";

export function HeroSection() {
  const isUnderConstruction =
    process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION === "true";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      setIsLoggedIn(response.data.success);
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };
  const secondaryCtas = [
    {
      href: "/competitions",
      title: "Explore Competitions",
      description:
        "Handpicked case challenges, deadlines, and prizes to sharpen your edge.",
      icon: Trophy,
      accent: "Case Library",
    },
    {
      href: "/business-opportunities",
      title: "Browse Opportunities",
      description:
        "Internships, mentorships, and leadership roles tailored to ambitious students.",
      icon: Briefcase,
      accent: "Opportunity Hub",
    },
  ];

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
                  text="High School Business Opportunities"
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
              Discover curated case competitions and business opportunities.
              Track deadlines, apply faster, and build your resume with one
              profile.
            </p>
          </AnimatedElement>

          <AnimatedElement animation="slideUp" delay={2.2}>
            <div className="flex flex-col items-center gap-4 justify-center mb-16">
              {/* --- THE NEW QUIZ BUTTON --- */}
              <div className="relative group w-full sm:w-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Link href="/findyouropp">
                  <Button
                    size="lg"
                    className="relative w-full sm:w-auto h-auto text-lg px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 font-bold transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
                        <p className="text-xl">Find Your Perfect Opportunity</p>
                      </div>
                      <p className="text-xs font-normal mt-1 opacity-80">
                        Take our 30-second quiz!
                      </p>
                    </div>
                  </Button>
                </Link>
              </div>

              {/* Login Section for Non-Authenticated Users */}
              {!loading && !isLoggedIn && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/auth/login-select">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#19613F] border-[#19613F] hover:border-[#2CA15F] transition-all duration-200"
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/login-select">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-[#19613F] hover:bg-[#2CA15F] text-white transition-all duration-200"
                    >
                      <UserPlus className="h-5 w-5 mr-2" />
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              )}

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
              <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
                {secondaryCtas.map(
                  ({ href, title, description, icon: Icon, accent }) => (
                    <Link key={href} href={href} className="group">
                      <motion.div
                        whileHover={{ y: -6, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="relative h-full overflow-hidden rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-[0_25px_60px_-30px_rgba(27,94,52,0.6)] backdrop-blur dark:border-emerald-500/30 dark:bg-[#11263b]/80"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/60 via-transparent to-emerald-200/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-[#1d3f32]/60 dark:to-[#0f271d]/80" />
                        <div className="relative flex h-full flex-col gap-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
                              <Compass className="h-4 w-4" />
                              {accent}
                            </span>
                            <span className="rounded-full bg-emerald-100/70 p-3 text-emerald-700 shadow-inner transition group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-900/50 dark:text-emerald-200 dark:group-hover:bg-emerald-600">
                              <Icon className="h-6 w-6" />
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-200">
                              {title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {description}
                            </p>
                          </div>
                          <div className="mt-auto flex items-center gap-2 pt-1 text-sm font-semibold text-emerald-700 transition group-hover:gap-3 group-hover:text-emerald-800 dark:text-emerald-200 dark:group-hover:text-emerald-100">
                            Start exploring
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ),
                )}
              </div>
            </div>
          </AnimatedElement>


        </div>
      </div>
    </section>
  );
}
