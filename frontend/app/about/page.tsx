"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import {
  FloatingElements,
  ParallaxElement,
} from "@/components/animations";
import { LogoWaterfall } from "@/components/animations/logo-waterfall";
import {
  Sparkles,
  Target,
  Rocket,
  Users,
  Compass,
  Map,
  ArrowRight,
  GraduationCap,
  Calendar,
  Globe,
} from "lucide-react";

const sections = [
  {
    title: "Spot the Signal",
    description:
      "Every accepted student post felt like a secret handshake. Our first sprint was simple: monitor hundreds of student newsletters, LinkedIn wins, and organizer drops so no one in our community ever misses out again.",
    icon: Compass,
  },
  {
    title: "Decode the Noise",
    description:
      "We mapped deadlines, prerequisites, formats, and outcomes—distilling sprawling PDFs into actionable insights. The result is an intelligence layer that lets students filter by ambition, schedule, and preferred learning style.",
    icon: Map,
  },
  {
    title: "Activate Opportunity",
    description:
      "Recommendations, onboarding resources, and quick-apply links make it frictionless to move from curiosity to submission. TPD isn’t a directory; it’s a launchpad built for momentum.",
    icon: Rocket,
  },
];

const stats = [
  { label: "Curated Opportunities", value: "120+", accent: "bg-emerald-500" },
  { label: "Deadlines Tracked", value: "365", accent: "bg-indigo-500" },
  { label: "Impact Stories", value: "50+", accent: "bg-amber-500" },
  { label: "Global Scouts", value: "30+", accent: "bg-rose-500" },
];

const values = [
  {
    title: "Radical Transparency",
    description:
      "We unpack every opportunity with honest previews, so you can make decisions with clarity—not guesswork.",
    icon: Sparkles,
  },
  {
    title: "Momentum Over Memorization",
    description:
      "We focus on experiences that compound skills—competitions, programs, and internships that create outsized growth.",
    icon: Target,
  },
  {
    title: "Community Intelligence",
    description:
      "Every win, every deadline tip, every inside scoop feeds back into TPD so the next student is even further ahead.",
    icon: Users,
  },
];

const timeline = [
  {
    period: "Discovery",
    headline: "Why is this so hard?",
    body: "Late-night LinkedIn scrolls, scattered group chats, and calendar chaos. We knew there had to be a better way.",
  },
  {
    period: "Build",
    headline: "We mapped the landscape.",
    body: "From Bay Street to Silicon Valley, we catalogued programs shaping the next generation of builders, analysts, and storytellers.",
  },
  {
    period: "Launch",
    headline: "Turning signals into leverage.",
    body: "With every new drop, TPD users receive tailored alerts, context, and prep resources—no more accidental FOMO.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#f3f8f6] dark:bg-[#0c1a2e]">
      <Navigation />
      <main className="relative pt-24 pb-24">
        <div className="absolute inset-0">
          <LogoWaterfall />
          <FloatingElements count={16} color="rgba(25, 97, 63, 0.12)" />
          <ParallaxElement speed={0.18} className="absolute inset-0">
            <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center" />
          </ParallaxElement>
          <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-transparent to-emerald-100/40 dark:from-[#0d1d32]/80 dark:via-transparent dark:to-[#091422]/80" />
        </div>

        {/* Hero */}
        <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-6 py-16"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 shadow-sm dark:bg-emerald-900/60 dark:text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Why TPD Exists
            </div>
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              We turn whispers into roadmaps&nbsp;
              <span className="bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">
                for ambitious students.
              </span>
            </motion.h1>
            <p className="mx-auto max-w-3xl text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              TPD was born from one truth: incredible business experiences shouldn&apos;t
              be insider knowledge. We capture every competition, internship, and intensive
              before the deadline hits—so you can build a portfolio that actually reflects your ambition.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, accent }) => (
              <motion.div
                key={label}
                className="rounded-2xl border border-white/50 bg-white/80 px-6 py-8 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#0d1f33]/80"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className={`inline-flex items-center justify-center rounded-full ${accent} px-4 py-1 text-sm font-semibold text-white`}>
                  {label}
                </div>
                <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="relative z-10 mt-24 bg-gradient-to-r from-white/80 via-white/40 to-emerald-100/40 px-4 py-16 sm:px-6 lg:px-8 dark:from-[#0e2035]/80 dark:via-[#0c1b2d]/60 dark:to-[#092023]/70">
          <div className="mx-auto max-w-5xl space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                The TPD Playbook
              </h2>
              <p className="mx-auto max-w-3xl text-gray-600 dark:text-gray-300">
                We treat opportunity discovery like a product sprint—fusing market intelligence with student
                insight to deliver timely, personalized pathways.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {sections.map(({ title, description, icon: Icon }, index) => (
                <motion.div
                  key={title}
                  className="group relative overflow-hidden rounded-2xl border border-emerald-200/40 bg-white/90 p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-emerald-700/40 dark:bg-[#0f1f2d]/80"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/0 via-transparent to-emerald-200/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-emerald-500/0 dark:to-emerald-500/30" />
                  <div className="relative flex flex-col gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-200">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="relative z-10 mt-24 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Our Momentum Timeline</h2>
            <p className="text-gray-600 dark:text-gray-300">
              TPD evolves with every student success. Here’s how the engine keeps accelerating.
            </p>
          </motion.div>

          <div className="mt-12 space-y-8">
            {timeline.map(({ period, headline, body }, index) => (
              <motion.div
                key={period}
                className="relative rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#0d1f33]/80"
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-emerald-400 via-indigo-400 to-transparent dark:from-emerald-500 dark:via-indigo-500 sm:left-10" />
                <div className="relative pl-10 sm:pl-16">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500 dark:text-emerald-300">
                    {period}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{headline}</h3>
                  <p className="mt-3 max-w-3xl text-sm text-gray-600 dark:text-gray-300">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="relative z-10 mt-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                The Principles Behind Every Recommendation
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We don’t just list opportunities—we vet them against the future you’re building.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {values.map(({ title, description, icon: Icon }, idx) => (
                <motion.div
                  key={title}
                  className="group rounded-2xl border border-emerald-200/40 bg-white/90 p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-emerald-700/40 dark:bg-[#0f1f2d]/80"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-200">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                  </div>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact callouts */}
        <section className="relative z-10 mt-24 bg-[#0f1f2d] px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-12 lg:flex-row">
            <motion.div
              className="flex-1 space-y-6"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Built for students who want more than a highlight reel.
              </h2>
              <p className="text-white/80">
                We aggregate the most competitive business experiences and make them navigable,
                transparent, and achievable. Whether you’re chasing Wall Street, building a startup,
                or leading your first case team—TPD gives you the playbook.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-emerald-300" />
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                      Prep Resources
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/80">
                    Templates, pitch decks, and interview prep directly linked to each program you explore.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-emerald-300" />
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                      Deadline Radar
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/80">
                    Opt-in to targeted reminders so you never learn about a flagship program the day after it closes.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex-1 space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 text-white/80">
                <Globe className="h-5 w-5 text-emerald-300" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Student Signals
                </span>
              </div>
              <blockquote className="space-y-4 text-lg leading-relaxed text-white/90">
                <p>
                  “Before TPD, keeping up with competitions felt like a full-time job. Now, I get a curated feed,
                  context on what it actually takes, and a toolkit for jumping in. I’ve led two teams to nationals
                  this year because I finally knew where to look.”
                </p>
                <footer className="text-sm uppercase tracking-widest text-white/70">
                  Grade 11 Case Lead · Vancouver, CA
                </footer>
              </blockquote>
              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/80"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-emerald-300" />
                New success stories drop weekly
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative z-10 mx-auto mt-24 max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            className="overflow-hidden rounded-3xl border border-emerald-200/60 bg-white/90 p-10 shadow-2xl backdrop-blur dark:border-emerald-700/40 dark:bg-[#0f1f2d]/80"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ready to build a portfolio that speaks louder than a resume?
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Join thousands of students unlocking curated experiences before the rest of their network even hears about them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/findyouropp"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Launch the Quiz
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/business-opportunities"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
              >
                Explore Opportunities
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
