// components/logo-waterfall.js
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// The list of all your logos from the public/images/ directory
const logos = [
  { src: "/images/td-logo.svg", alt: "TD Bank" },
  { src: "/images/hospital-for-sick-children-logo.svg", alt: "SickKids Foundation" },
  { src: "/images/ja-central-ontario-logo.png", alt: "JA Canada" },
  { src: "/images/icon-talent-partners-logo.png", alt: "Icon Talent Partners" },
  { src: "/images/uoft-logo.jpg", alt: "University of Toronto" },
  { src: "/images/ivey-logo.png", alt: "Ivey Business School" },
  { src: "/images/schulich-logo.png", alt: "Schulich School of Business" },
  { src: "/images/sun-life-financial-logo.png.png", alt: "Sun Life" },
  { src: "/images/rotman-logo.png", alt: "Rotman Commerce" },
  { src: "/images/mina-project-logo.png", alt: "The MINA Project" },
];

const LogoColumn = ({ logos, duration }) => {
  // We render the logos twice in a row for a seamless, infinite loop effect
  const duplicatedLogos = [...logos, ...logos];
  return (
    <motion.div
      className="flex flex-col gap-16"
      animate={{ y: ["0%", "-100%"] }} // This animates the column upwards
      transition={{ ease: "linear", duration, repeat: Infinity }}
    >
      {duplicatedLogos.map((logo, index) => (
        <Image
          key={index}
          src={logo.src}
          alt={logo.alt}
          width={120} // Adjusted for better visibility
          height={56}
          className="h-14 w-auto object-contain"
          style={{ opacity: 0.3 }} // This makes the logos faint
        />
      ))}
    </motion.div>
  );
};

export function LogoWaterfall() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* This mask fades the logos at the very top and bottom of the screen */}
      <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]" />
      
      {/* We create several columns, each with a different set of logos and animation speed */}
      <div className="relative flex h-full justify-around gap-16 -translate-y-1/4">
        <LogoColumn logos={logos.slice(0, 4)} duration={25} />
        <LogoColumn logos={logos.slice(4, 8)} duration={35} />
        <LogoColumn logos={logos.slice(8, 11).concat(logos.slice(0,1))} duration={30} />
        {/* The columns below are for wider screens */}
        <div className="hidden md:flex">
          <LogoColumn logos={logos.slice(2, 6)} duration={22} />
        </div>
        <div className="hidden lg:flex">
          <LogoColumn logos={logos.slice(7, 11)} duration={32} />
        </div>
      </div>
    </div>
  );
}
