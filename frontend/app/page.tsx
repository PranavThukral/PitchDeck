import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { PastWinnersSection } from "@/components/sections/past-winners-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { CursorProvider } from "@/components/providers/cursor-provider";

export default function HomePage() {
  // Check if site is under construction
  const isUnderConstruction =
    process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION === "true";

  return (
    <CursorProvider>
      <div className="min-h-screen">
        <Navigation />
        <HeroSection />
        {/* Only render Features (About Us) section when not in construction mode */}
        {!isUnderConstruction && <FeaturesSection />}
        {/* Only render Past Winners (Champions) section when not in construction mode */}
        {!isUnderConstruction && <PastWinnersSection />}
        <NewsletterSection />
        <Footer />
      </div>
    </CursorProvider>
  );
}
