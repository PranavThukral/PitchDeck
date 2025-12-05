"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FloatingElements, ParallaxElement } from "@/components/animations";
import { LogoWaterfall } from "@/components/animations/logo-waterfall";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import {
  ArrowRight,
  Mail,
  Megaphone,
  Search,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";

const logos = [
  { src: "/images/ja-central-ontario-logo.png", alt: "JA Company Program" },
  { src: "/images/mina-project-logo.png", alt: "MINA Project" },
  { src: "/images/ivey-logo.png", alt: "Ivey Business School" },
];

const pillars = [
  {
    title: "Top Research",
    description:
      "We scan trusted sources and only ship the opportunities with real ROI for students.",
    icon: Search,
  },
  {
    title: "Information Outreach",
    description:
      "Openings go live across the site and our socials with reminders before every deadline.",
    icon: Megaphone,
  },
  {
    title: "Top Case Competitions",
    description:
      "Free online cases with real judges so you can practice, win, and get feedback that sticks.",
    icon: Trophy,
  },
];

const involvement = [
  {
    title: "Executive Applications",
    description:
      "Think like a builder and can move fast? Email us what you can contribute plus your resume.",
    footer: "Applications reviewed on a rolling basis.",
    cta: {
      href: "mailto:thepitchdeckorg@gmail.com?subject=Executive%20Application&body=Tell%20us%20how%20you%27d%20like%20to%20contribute%20and%20attach%20your%20resume.",
      label: "Email our team",
      icon: Mail,
    },
  },
  {
    title: "Contributor",
    description:
      "Know a great opportunity? Share the link and details - we'll credit you and spread it fast.",
    footer: "We spotlight the best tips and give full credit.",
    cta: {
      href: "mailto:thepitchdeckorg@gmail.com?subject=Contributor%20Opportunity%20Tip&body=Share%20the%20opportunity%20link,%20deadline,%20and%20who%20it's%20best%20for.%20We'll%20handle%20the%20rest.",
      label: "Become a contributor",
      icon: Share2,
    },
  },
];

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fbff] via-[#f3f8f6] to-[#fff7ed] text-gray-900 dark:from-[#0c1a2e] dark:via-[#0b1728] dark:to-[#0f1f2d] dark:text-gray-100">
      <Navigation />
      <main className="relative">
        <section className="relative overflow-hidden pt-28 pb-20">
          <LogoWaterfall />
          <FloatingElements count={14} color="rgba(79, 70, 229, 0.1)" />
          <ParallaxElement speed={0.2} className="absolute inset-0">
            <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center" />
          </ParallaxElement>
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-emerald-50/70 to-amber-50/60 dark:from-[#0a1628]/85 dark:via-[#0f2a30]/60 dark:to-[#0b1e34]/70" />

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="space-y-8 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 shadow-sm dark:bg-emerald-900/60 dark:text-emerald-200">
                  <Sparkles className="h-4 w-4" />
                  Our Story
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">
                    Built for momentum
                  </p>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
                    Opportunities should feel{" "}
                    <span className="relative inline-block px-1">
                      <span className="relative z-10">simple.</span>
                      <span
                        className="absolute -bottom-2 left-0 right-0 h-3 rounded-full bg-gradient-to-r from-emerald-200 via-amber-100 to-emerald-300 blur-[2px] dark:from-emerald-500/50 dark:via-amber-400/50 dark:to-emerald-400/50"
                        aria-hidden="true"
                      />
                    </span>
                  </h1>
                  <p className="max-w-2xl text-lg text-gray-700 dark:text-gray-200">
                    Sign in, see the best options for you, and know the next
                    step before the deadline sneaks up. Fewer words, clearer
                    actions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/findyouropp"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-2xl"
                  >
                    Find your fit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#get-involved"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-300 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
                  >
                    Get involved
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-[#0f1f2d]/80">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">
                  At a glance
                </p>
                <div className="mt-4 space-y-4 text-sm text-gray-800 dark:text-gray-100">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                    <div>
                      <p className="font-semibold">
                        Fresh, vetted drops weekly
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Only the opportunities with real impact make it here.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                    <div>
                      <p className="font-semibold">Next steps spelled out</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Apply faster with deadlines, links, and quick filters.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                    <div>
                      <p className="font-semibold">Community wins</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Students share what worked so others can follow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-gradient-to-br from-white/95 via-emerald-50/60 to-amber-50/60 p-8 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-[#0d1f33]/90 dark:from-[#0f1f2d]/90 dark:via-[#0d1f33]/80 dark:to-[#0f1f2d]/90">
            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <div className="space-y-6 md:col-span-5">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  The best opportunities for high school students are hidden.
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-200">
                  We built PitchDeck so those posts don't surprise you.
                  Everything is curated, timestamped, and easy to scan in one
                  place.
                </p>
                <div className="h-px w-20 bg-gradient-to-r from-emerald-500 to-indigo-500" />
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">
                  Rooted in real programs
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-8 shadow-inner dark:border-emerald-800/60 dark:bg-emerald-900/30 md:col-span-7">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {logos.map((logo) => (
                    <div
                      key={logo.alt}
                      className="flex items-center justify-center rounded-xl bg-emerald-50/70 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:bg-[#0f1f2d]"
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={220}
                        height={120}
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="text-center space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 shadow-sm dark:bg-emerald-900/60 dark:text-emerald-200">
                <Sparkles className="h-4 w-4" />
                How we do it
              </p>
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                The engine that keeps students ahead
              </h3>
              <p className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
                Everything here is tuned to surface what matters when it matters
                and to keep you moving without the clutter.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              {pillars.map(({ title, description, icon: Icon }, index) => {
                const isPrimary = index === 0;
                return (
                  <motion.div
                    key={title}
                    className={`group relative h-full overflow-hidden rounded-2xl border p-6 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                      isPrimary
                        ? "md:col-span-2 bg-gradient-to-br from-emerald-600 to-indigo-600 border-transparent text-white"
                        : "border-emerald-200/60 bg-white/90 dark:border-emerald-700/50 dark:bg-[#0f1f2d]/90"
                    }`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                  >
                    {!isPrimary && (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/0 via-transparent to-emerald-200/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-emerald-500/0 dark:to-emerald-500/20" />
                    )}
                    <div className="relative space-y-4">
                      <span
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ${
                          isPrimary
                            ? "bg-white/20 text-white"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <h4
                        className={`text-xl font-semibold ${
                          isPrimary
                            ? "text-white"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {title}
                      </h4>
                      <p
                        className={`text-sm leading-relaxed ${
                          isPrimary
                            ? "text-white/90"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="get-involved"
          className="relative z-10 mt-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="text-center space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-800 shadow-sm dark:bg-indigo-900/50 dark:text-indigo-100">
                Get Involved
              </p>
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Like our mission? Join the build.
              </h3>
              <p className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
                Lead from the inside or tip us off to the next great program;
                both move the mission forward.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {involvement.map(({ title, description, footer, cta }, index) => {
                const Icon = cta.icon;
                return (
                  <motion.div
                    key={title}
                    className={`relative overflow-hidden rounded-2xl border border-white/60 bg-white/95 p-8 shadow-2xl backdrop-blur transition duration-300 hover:-translate-y-2 hover:shadow-[0_25px_70px_-35px_rgba(25,97,63,0.6)] dark:border-white/10 dark:bg-[#0d1f33]/90 ${
                      index === 0
                        ? "bg-gradient-to-br from-emerald-50 via-white to-indigo-50"
                        : "bg-gradient-to-br from-indigo-50 via-white to-amber-50"
                    }`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-transparent to-indigo-200/50 opacity-60 dark:from-emerald-500/20 dark:via-transparent dark:to-indigo-500/20" />
                    <div className="relative space-y-4">
                      <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {title}
                      </h4>
                      <p className="text-base text-gray-700 dark:text-gray-200">
                        {description}
                      </p>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                        {footer}
                      </p>
                      <Link
                        href={cta.href}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
                      >
                        <Icon className="h-4 w-4" />
                        {cta.label}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-24 px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-white/90 via-emerald-50/60 to-white/80 p-10 text-center shadow-2xl backdrop-blur dark:from-[#0f1f2d]/90 dark:via-[#0d1f33]/70 dark:to-[#0f1f2d]/90">
            <div className="space-y-4">
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                For the good of{" "}
                <span className="relative inline-block px-1">
                  <span className="relative z-10">every student</span>
                  <span
                    className="absolute -bottom-2 left-0 right-0 h-3 rounded-full bg-gradient-to-r from-emerald-200 via-amber-100 to-emerald-300 blur-[2px] dark:from-emerald-500/50 dark:via-amber-400/50 dark:to-emerald-400/50"
                    aria-hidden="true"
                  />
                </span>
              </p>
              <p className="max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
                Every feature, partnership, and post is built to open doors.
                Let's keep pushing forward together.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
