import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medicine Opportunities & Competitions | The Pitch Deck",
  description:
    "Explore research labs, shadowing, healthcare programs, and medical competitions curated for aspiring clinicians.",
  keywords:
    "medicine opportunities, medical competitions, pre-med programs, hospital shadowing, healthcare internships, research labs",
  openGraph: {
    title: "Medicine Opportunities & Competitions | The Pitch Deck",
    description:
      "Explore research labs, shadowing, healthcare programs, and medical competitions curated for aspiring clinicians.",
    type: "website",
    url: "/medicine-opportunities",
  },
  twitter: {
    card: "summary_large_image",
    title: "Medicine Opportunities & Competitions | The Pitch Deck",
    description:
      "Explore research labs, shadowing, healthcare programs, and medical competitions curated for aspiring clinicians.",
  },
};

export default function MedicineOpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
