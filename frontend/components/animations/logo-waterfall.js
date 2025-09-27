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

// Helper function to create a shuffled copy of the logos array
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const LogoColumn = ({ logos, duration }) => {
  // We still duplicate the logos to create the seamless loop
  const duplicatedLogos = [...logos, ...logos];

  return (
    <motion.div
      className="flex flex-col gap-16"
      // *** THE FIX FOR THE CHOPPY JUMP ***
      // We now animate to -50% instead of -100%. This moves the column
      // up by exactly the height of ONE set of logos, creating a perfect loop.
      animate={{ y: ["0%", "-50%"] }}
      transition={{ ease: "linear", duration, repeat: Infinity }}
    >
      {duplicatedLogos.map((logo, index) => (
        <Image
          key={index}
          src={logo.src}
          alt={logo.alt}
          width={120}
          height={56}
          className="h-14 w-auto object-contain flex-shrink-0" // Added flex-shrink-0
          style={{ opacity: 0.3 }}
        />
      ))}
    </motion.div>
  );
};

export function LogoWaterfall() {
  // *** THE FIX FOR THE EMPTY GAPS ***
  // We create 5 full, but differently shuffled, arrays of logos.
  // Now every column is guaranteed to be completely full at all times.
  const col1 = shuffleArray(logos);
  const col2 = shuffleArray(logos);
  const col3 = shuffleArray(logos);
  const col4 = shuffleArray(logos);
  const col5 = shuffleArray(logos);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]" />
      
      {/* Each column now receives a full set of logos */}
      <div className="relative flex h-full justify-around gap-16">
        <LogoColumn logos={col1} duration={25} />
        <LogoColumn logos={col2} duration={35} />
        <LogoColumn logos={col3} duration={30} />
        <div className="hidden md:flex">
          <LogoColumn logos={col4} duration={22} />
        </div>
        <div className="hidden lg:flex">
          <LogoColumn logos={col5} duration={32} />
        </div>
      </div>
    </div>
  );
}
