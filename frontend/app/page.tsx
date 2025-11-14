import { HeroSection } from "@/components/sections/hero-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { CursorProvider } from "@/components/providers/cursor-provider";
import { WebSiteStructuredData } from "@/components/seo/structured-data";

export default function HomePage() {
  return (
    <CursorProvider>
      <div className="min-h-screen">
        <WebSiteStructuredData />
        <Navigation />
        <HeroSection />
        <NewsletterSection />
        <Footer />
      </div>
    </CursorProvider>
  );
}
