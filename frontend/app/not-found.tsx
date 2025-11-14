"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { FloatingElements, ParallaxElement } from "@/components/animations";
import { LogoWaterfall } from "@/components/animations/logo-waterfall";
import { Compass, MapPin, Rocket, ArrowRight } from "lucide-react";

const links = [
  {
    label: "Back to Home Base",
    href: "/",
    icon: Compass,
  },
  {
    label: "Explore Opportunities",
    href: "/business-opportunities",
    icon: MapPin,
  },
  {
    label: "Find Competitions",
    href: "/competitions",
    icon: Rocket,
  },
];

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#f7faf8] via-white to-[#e8f6f0] dark:from-[#070f1c] dark:via-[#091525] dark:to-[#0b1c2c]">
      <Navigation />
      <main className="relative pt-24 pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <LogoWaterfall />
          <FloatingElements count={10} color="rgba(25, 97, 63, 0.12)" />
          <ParallaxElement speed={0.18} className="absolute inset-0">
            <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center" />
          </ParallaxElement>
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-emerald-100/30 dark:from-[#0d1d32]/70 dark:via-transparent dark:to-[#0b241f]/70" />
        </div>

        <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-10 px-6 text-center sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6 rounded-3xl border border-white/60 bg-white/95 p-8 sm:p-12 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-[#0f1f2d]/85"
          >
            <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40">
              <Image
                src="/images/TPD.png"
                alt="Illustration of a student exploring opportunities"
                fill
                className="rounded-full object-cover shadow-lg"
                sizes="160px"
                priority
              />
            </div>
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
                lost?
              </span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                We don&apos;t have that page yet.
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                No worries! These links will get you to the most popular spots in seconds.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid w-full gap-4 sm:grid-cols-3"
          >
            {links.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group relative overflow-hidden rounded-2xl border border-emerald-200/50 bg-white/80 p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl dark:border-emerald-700/40 dark:bg-[#0f1f2d]/80"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/0 via-transparent to-emerald-200/60 opacity-0 transition-opacity group-hover:opacity-100 dark:from-emerald-500/0 dark:to-emerald-500/30" />
                <div className="relative flex flex-col gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {label}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition group-hover:gap-3 group-hover:text-emerald-700 dark:text-emerald-200 dark:group-hover:text-emerald-100">
                    Navigate
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 text-sm text-gray-500 dark:text-gray-400"
          >
            Need something specific? DM us on Instagram @thepitchdeck and we&apos;ll help you find it.
          </motion.p>
        </section>
      </main>

      <Footer />
    </div>
  );
}




