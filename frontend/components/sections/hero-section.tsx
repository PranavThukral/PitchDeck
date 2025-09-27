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
import { LogoWaterfall } from "@/components/animations/logo-waterfall"; // Corrected import path

export function HeroSection() {
  // Check if site is under construction
  const isUnderConstruction =
    process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION === "true";

  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#D9D9D9] via-white to-[#D9D9D9] dark:from-[#0c1a2e] dark:via-[#102338] dark:to-[#152a45] dark:text-white relative overflow-hidden">
      
      <LogoWaterfall /> {/* Logo waterfall is placed here, in the background */}

      <FloatingElements count={12} />
      <ParallaxElement speed={0.2} className="absolute inset-0">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center mix-blend-overlay"></div>
      </ParallaxElement>

      {/* This container ensures all text and buttons appear ON TOP of the waterfall */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center animate-fade-in">
          <AnimatedElement animation="slideUp" delay={0.2}>
            <div className="text-4xl sm:text-6xl font-bold font-serif text-black mb-6 dark:text-card-foreground leading-snug">
              <AnimatedText
                text="The Ultimate Platform for"
                animation="letterByLetter"
                staggerChildren={0.02}
              />
              <br />
              <AnimatedText
                text="High School Business Opportunities" // Spelling corrected
                className="gradient-text inline-block"
                animation="wordByWord"
                staggerChildren={0.1}
                delay={1.2}
              />
            </div>
          </AnimatedElement>
          <AnimatedElement animation="fadeIn" delay={1.8}>
            <p className="text-xl text-black mb-8 max-w-3xl mx-auto dark:text-gray-300">
              Discover Canada's best high school business opportunities. {/* Spelling corrected */}
              Build your skills, resume, and gain incredible exposure, all in one place. 
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
                      <p className="text-xl font-bold">Explore Cases</p> {/* Text corrected for consistency */}
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
                      <ArrowRight className="ml-4 h-5 w-5" /> {/* Spacing corrected */}
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </AnimatedElement>

          {/* Stats Section - Only shown when not in construction mode */}
          {!isUnderConstruction && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* The rest of the stats section remains unchanged */}
              <AnimatedElement animation="zoom" delay={2.6} duration={0.5}>
                <motion.div
                  className="text-center p-5 bg-white/50 dark:bg-[#1a3047]/70 rounded-lg shadow-sm backdrop-blur-sm dark:border dark:border-[#2CA15F]/20"
                  whileHover={{
                    y: -8,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <div className="flex justify-center mb-4">
                    <motion.div
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Trophy className="h-12 w-12 text-[#19613F]" />
                    </motion.div>
                  </div>
                  <motion.h3
                    className="text-3xl font-bold font-serif text-[#2CA15F] mb-2 dark:text-card-foreground"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.0, duration: 0.5 }}
                  >
                    <AnimatedText
                      text="50+"
                      animation="highlight"
                      delay={3.2}
                    />
                  </motion.h3>
                  <p className="text-black dark:text-gray-300">
                    Active Competitions
                  </p>
                </motion.div>
              </AnimatedElement>

              <AnimatedElement animation="zoom" delay={2.8} duration={0.5}>
                <motion.div
                  className="text-center p-5 bg-white/50 dark:bg-[#1a3047]/70 rounded-lg shadow-sm backdrop-blur-sm dark:border dark:border-[#2CA15F]/20"
                  whileHover={{
                    y: -8,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <div className="flex justify-center mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Users className="h-12 w-12 text-[#19613F]" />
                    </motion.div>
                  </div>
                  <motion.h3
                    className="text-3xl font-bold font-serif text-[#2CA15F] mb-2 dark:text-card-foreground"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.2, duration: 0.5 }}
                  >
                    <AnimatedText
                      text="5,000+"
                      animation="highlight"
                      delay={3.4}
                    />
                  </motion.h3>
                  <p className="text-black dark:text-gray-300">
                    Student Competitors
                  </p>
                </motion.div>
              </AnimatedElement>

              <AnimatedElement animation="zoom" delay={3.0} duration={0.5}>
                <motion.div
                  className="text-center p-5 bg-white/50 dark:bg-[#1a3047]/70 rounded-lg shadow-sm backdrop-blur-sm dark:border dark:border-[#2CA15F]/20"
                  whileHover={{
                    y: -8,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <div className="flex justify-center mb-4">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Award className="h-12 w-12 text-[#19613F]" />
                    </motion.div>
                  </div>
                  <motion.h3
                    className="text-3xl font-bold font-serif text-[#2CA15F] mb-2 dark:text-card-foreground"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.4, duration: 0.5 }}
                  >
                    <AnimatedText
                      text="$250K+"
                      animation="highlight"
                      delay={3.6}
                    />
                  </motion.h3>
                  <p className="text-black dark:text-gray-300">
                    Total Prize Money
                  </p>
                </motion.div>
              </AnimatedElement>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
