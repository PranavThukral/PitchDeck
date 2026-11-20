import { QuizForm } from "@/app/findyouropp/quiz-form";
import { FloatingElements, ParallaxElement } from "@/components/animations";
import { LogoWaterfall } from "@/components/animations/logo-waterfall";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import {
  fetchBusinessOpportunitiesFromSheets,
  fetchCompetitionsFromSheets,
  fetchEngineeringCompetitionsFromSheets,
  fetchEngineeringOpportunitiesFromSheets,
  fetchMedicineCompetitionsFromSheets,
  fetchMedicineOpportunitiesFromSheets,
} from "@/lib/services/google-sheets";
import { Sparkles } from "lucide-react";

export default async function QuizPage() {
  // Fetch all data on the server to pass to the client component
  const [
    businessCompetitions,
    businessOpportunities,
    medicineCompetitions,
    medicineOpportunities,
    engineeringCompetitions,
    engineeringOpportunities,
  ] = await Promise.all([
    fetchCompetitionsFromSheets(),
    fetchBusinessOpportunitiesFromSheets(),
    fetchMedicineCompetitionsFromSheets(),
    fetchMedicineOpportunitiesFromSheets(),
    fetchEngineeringCompetitionsFromSheets(),
    fetchEngineeringOpportunitiesFromSheets(),
  ]);

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#f2f8f4] via-white to-[#e5f5ec] dark:from-[#0c1a2e] dark:via-[#102338] dark:to-[#193252]">
      <Navigation />
      <main className="relative flex-1 overflow-hidden pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <LogoWaterfall />
          <FloatingElements count={12} color="rgba(25, 97, 63, 0.12)" />
          <ParallaxElement speed={0.12} className="absolute inset-0">
            <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center" />
          </ParallaxElement>
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-emerald-100/35 dark:from-[#0f2236]/70 dark:via-transparent dark:to-[#071420]/80" />
        </div>

        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10">
          <div className="text-center space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700 shadow-sm dark:bg-emerald-900/60 dark:text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Tailored To You
            </span>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
              Find Your Perfect Opportunity
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Answer a few quick questions and we’ll surface the competitions and programs that align with your goals.
            </p>
          </div>

          <QuizForm
            itemsByPath={{
              business: [...businessCompetitions, ...businessOpportunities],
              medicine: [...medicineCompetitions, ...medicineOpportunities],
              engineering: [
                ...engineeringCompetitions,
                ...engineeringOpportunities,
              ],
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
