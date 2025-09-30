"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Users, Award } from "lucide-react";
import Link from "next/link";

import {
  AnimatedElement,
  AnimatedText,
  FloatingElements,
  ParallaxElement,
} from "@/components/animations";
import { motion } from "framer-motion";
import { LogoWaterfall } from "@/components/animations/logo-waterfall";

export function HeroSection() {
  // Check if site is under construction
  const isUnderConstruction =
    process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION === "true";

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
            {/* *** THE BULLETPROOF FIX *** */}
            {/* 1. We apply `leading-none` to the container to remove any extra line-height. */}
            <div className="text-4xl sm:text-6xl font-bold font-serif text-black mb-6 dark:text-card-foreground leading-none">
              <AnimatedText
                text="The Ultimate Platform for"
                animation="letterByLetter"
                staggerChildren={0.02}
              />

              {/* 2. We wrap the second line in a div and use `transform` to physically pull it upwards. */}
              {/* This will override any internal margins or spacing from the component itself. */}
              <div className="transform -translate-y-2 sm:-translate-y-4">
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
              Discover Canada's best high school business opportunities. Build
              your skills, resume, and gain incredible exposure, all in one
              place.
            </p>
          </AnimatedElement>

          <AnimatedElement animation="slideUp" delay={2.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/competitions">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className="h-auto text-lg px-8 py-4 bg-[#19613F] hover:bg-[#2CA15F] dark:shadow-[0_0_15px_rgba(44,161,95,0.4)] w-full sm:w-auto"
                  >
                    <div className="text-center">
                      <p className="text-xl font-bold">Explore Cases</p>
                      <p className="text-xs font-normal mt-1 text-white/80">
                        National Case Competitions, Exams, and Contests
                      </p>
                    </div>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRight className="ml-4 h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/business-opportunities">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-auto group py-4 bg-transparent border-[#19613F] text-[#19613F] hover:bg-[#19613F] hover:text-white w-full sm:w-auto text-wrap px-8"
                  >
                    <div className="text-center">
                      <p className="text-xl font-bold">
                        Explore Business Opportunities
                      </p>
                      <p className="text-xs font-normal mt-1 text-[#19613F]/80 group-hover:text-white/80">
                        Internships, Scholarships, and Job Shadowing
                      </p>
                    </div>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRight className="ml-4 h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </AnimatedElement>

          {/* Stats Section */}
          {!isUnderConstruction && (
            <AnimatedElement animation="slideUp" delay={2.6}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                >
                  <Trophy className="h-8 w-8 text-[#2CA15F] mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                    50+
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Competitions Available
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                >
                  <Users className="h-8 w-8 text-[#2CA15F] mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                    1000+
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Students Empowered
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                >
                  <Award className="h-8 w-8 text-[#2CA15F] mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                    25+
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Partner Organizations
                  </p>
                </motion.div>
              </div>
            </AnimatedElement>
          )}
        </div>
      </div>
    </section>
  );
}
