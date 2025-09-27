// components/logo-waterfall.js
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useMemo } from "react";
// The list of all your logos from the public/images/ directory
const logos = [
  { src: "/images/td-logo.svg", alt: "TD Bank" },
  { src: "/images/hospital-for-sick-children-logo.svg", alt: "SickKids Foundation" },
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
      initial={{ top: "-20%" }} // Start above the screen
      animate={{ top: "120%" }} // End below the screen
      transition={{
        ease: "linear",
        repeat: Infinity,
        duration,
        delay,
      }}
    >
      {/* THE FIX FOR JARRING SIZES: A standardized container */}
      <div className="w-32 h-20 flex items-center justify-center p-2">
        <Image
          src={logo.src}
          alt={logo.alt}
          width={120}
          height={80}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          style={{ opacity: 0.25 }} // Slightly less faint to be visible
        />
      </div>
    </motion.div>
  );
};

export function LogoWaterfall() {
  // We use useMemo to generate the random particles only once, preventing flickering
  const particles = useMemo(() => {
    const particleList = [];
    // Increase the number of particles for a denser, more dynamic feel
    const numParticles = 30; 

    for (let i = 0; i < numParticles; i++) {
      particleList.push({
        logo: logos[i % logos.length], // Cycle through the logos
        // Random horizontal start position
        initialX: Math.random() * 95, 
        // THE FIX FOR SPEED: Duration is now randomized between 8 and 15 seconds
        duration: Math.random() * 7 + 8,
        // Random delay to stagger the start times, creating the waterfall effect
        delay: Math.random() * 15,
      });
    }
    return particleList;
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* The mask is still useful to fade logos in and out at the edges */}
      <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_bottom,transparent,white_5%,white_95%,transparent)]" />
      
      {/* THE FIX FOR THE GRID: We now render individual, randomized particles */}
      <div className="relative w-full h-full">
        {particles.map((particle, index) => (
          <LogoParticle key={index} {...particle} />
        ))}
      </div>
    </div>
  );
}
