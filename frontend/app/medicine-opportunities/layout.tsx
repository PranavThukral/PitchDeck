import { buildPageMetadata } from "@/lib/seo/simple-metadata";

export const metadata = buildPageMetadata({
  title: "Medicine Opportunities & Competitions | The Pitch Deck",
  description:
    "Explore research labs, shadowing, healthcare programs, and medical competitions curated for aspiring clinicians.",
  keywords:
    "medicine opportunities, medical competitions, pre-med programs, hospital shadowing, healthcare internships, research labs",
  url: "/medicine-opportunities",
});

export default function MedicineOpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
