"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

interface AnnouncementPayload {
  isEnabled: boolean;
  title: string;
  message: string;
  imageUrl: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  updatedAt: string | null;
}

const SECONDARY_FALLBACK = "/business-opportunities";
const DISMISS_PREFIX = "tpd-social-popup-dismissed-";

export function SocialPopup() {
  const [announcement, setAnnouncement] = useState<AnnouncementPayload | null>(
    null,
  );
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAnnouncement = async () => {
      try {
        const response = await fetch("/api/announcement", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!isMounted) return;

        if (!data?.success || !data?.data?.isEnabled) {
          return;
        }

        const payload: AnnouncementPayload = data.data;
        const versionSuffix = payload.updatedAt
          ? new Date(payload.updatedAt).getTime().toString()
          : "default";
        const key = `${DISMISS_PREFIX}${versionSuffix}`;

        setAnnouncement(payload);
        setStorageKey(key);

        if (typeof window !== "undefined") {
          const alreadyDismissed = window.localStorage.getItem(key);
          if (!alreadyDismissed) {
            // small delay for smoother experience
            setTimeout(() => setIsVisible(true), 400);
          }
        }
      } catch (error) {
        console.error("Failed to load announcement popup:", error);
      }
    };

    loadAnnouncement();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (storageKey && typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "dismissed");
    }
  };

  const imageSrc = useMemo(() => {
    if (!announcement?.imageUrl) return "/images/TPD.png";
    return announcement.imageUrl;
  }, [announcement?.imageUrl]);

  const primaryCtaUrl =
    announcement?.primaryCtaUrl && announcement.primaryCtaUrl.trim() !== ""
      ? announcement.primaryCtaUrl
      : "/auth/general/signup";

  const secondaryCtaUrl =
    announcement?.secondaryCtaUrl && announcement.secondaryCtaUrl.trim() !== ""
      ? announcement.secondaryCtaUrl
      : SECONDARY_FALLBACK;

  const primaryIsExternal = primaryCtaUrl.startsWith("http");

  return (
    <AnimatePresence>
      {isVisible && announcement && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleDismiss}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-3xl border border-emerald-200/60 bg-white/95 p-6 shadow-2xl dark:border-emerald-700/40 dark:bg-[#0f1f2d]/95"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-popup-title"
          >
            <button
              aria-label="Close popup"
              onClick={handleDismiss}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/80 bg-white text-emerald-700 shadow-sm transition hover:scale-105 hover:text-emerald-800 dark:border-emerald-700/60 dark:bg-[#0f1f2d]/90 dark:text-emerald-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col gap-6">
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl border border-emerald-200/60 bg-emerald-50 shadow-inner dark:border-emerald-700/60 dark:bg-emerald-900/30">
              <Image
                src={imageSrc}
                alt={announcement.title}
                fill
                className="object-cover"
                sizes="120px"
                unoptimized
              />
              </div>

              <div className="space-y-3 text-center">
                <h2
                  id="social-popup-title"
                  className="text-2xl font-semibold text-gray-900 dark:text-white"
                >
                  {announcement.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {announcement.message}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <Link
                  href={primaryCtaUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                  target={primaryIsExternal ? "_blank" : undefined}
                  rel={primaryIsExternal ? "noopener noreferrer" : undefined}
                  prefetch={false}
                >
                  {announcement.primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={secondaryCtaUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                  prefetch={false}
                >
                  {announcement.secondaryCtaLabel}
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
