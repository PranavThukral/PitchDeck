// components/logo-waterfall.js
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";

// The list of all your logos from the public/images/ directory
const logos = [
  { src: "/images/td-logo.svg", alt: "TD Bank" },
  {
    src: "/images/hospital-for-sick-children-logo.svg",
    alt: "SickKids Foundation",
  },
  { src: "/images/ja-central-ontario-logo.png", alt: "JA Canada" },
  { src: "/images/icon-talent-partners-logo.png", alt: "Icon Talent Partners" },
  { src: "/images/uoft-logo.jpg", alt: "University of Toronto" },
  { src: "/images/ivey-logo.png", alt: "Ivey Business School" },
  { src: "/images/schulich-logo.png", alt: "Schulich School of Business" },
  { src: "/images/sun-life-financial-logo.png", alt: "Sun Life" },
  { src: "/images/rotman-logo.png", alt: "Rotman Commerce" },
  { src: "/images/mina-project-logo.png", alt: "The MINA Project" },
];

const LogoParticle = ({ logo, initialX, duration, delay }) => {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${initialX}%` }}
      initial={{ top: "-20%" }}
      animate={{ top: "120%" }}
      transition={{
        ease: "linear",
        repeat: Infinity,
        duration,
        delay,
      }}
    >
      <div className="w-32 h-20 flex items-center justify-center p-2">
        <Image
          src={logo.src}
          alt={logo.alt}
          width={120}
          height={80}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          style={{ opacity: 0.35 }}
        />
      </div>
    </motion.div>
  );
};

export function LogoWaterfall() {
  const [particles, setParticles] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Generate particles only on client side to avoid hydration mismatch
    const generateParticles = () => {
      // Proximity threshold (as a percentage of screen width).
      // Two of the same logo cannot be within this distance of each other.
      const HORIZONTAL_PROXIMITY_THRESHOLD = 15; // 15%
      const numParticles = 30;
      const particleList = [];

      for (let i = 0; i < numParticles; i++) {
        let newParticle;
        let hasConflict;
        let attempts = 0;
        const MAX_RETRIES = 20; // Safety break to prevent infinite loops

        do {
          hasConflict = false;
          // 1. Generate a candidate particle with truly random properties
          newParticle = {
            logo: logos[Math.floor(Math.random() * logos.length)],
            initialX: Math.random() * 95,
            duration: Math.random() * 7 + 8,
            delay: Math.random() * 15,
          };

          // 2. Check for proximity conflicts with all previously placed particles
          for (const existingParticle of particleList) {
            if (
              existingParticle.logo.src === newParticle.logo.src &&
              Math.abs(existingParticle.initialX - newParticle.initialX) <
                HORIZONTAL_PROXIMITY_THRESHOLD
            ) {
              hasConflict = true; // Found a conflict!
              break; // No need to check further, we must retry
            }
          }
          attempts++;
        } while (hasConflict && attempts < MAX_RETRIES);

        // 3. Add the validated particle to our list
        particleList.push(newParticle);
      }
      return particleList;
    };

    setParticles(generateParticles());
  }, []);

  // Don't render particles until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_bottom,transparent,white_5%,white_95%,transparent)]" />
        <div className="relative w-full h-full" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_bottom,transparent,white_5%,white_95%,transparent)]" />
      <div className="relative w-full h-full">
        {particles.map((particle, index) => (
          <LogoParticle key={index} {...particle} />
        ))}
      </div>
    </div>
  );
}
