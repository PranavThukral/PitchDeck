import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Competitor Dashboard | The Pitch Deck",
  description:
    "Manage your competition applications, track deadlines, and access your personalized opportunities dashboard.",
  keywords: "dashboard, my applications, competition tracker, competitor portal",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Competitor Dashboard | The Pitch Deck",
    description:
      "Manage your competition applications, track deadlines, and access your personalized opportunities dashboard.",
    type: "website",
    url: "/dashboard/competitor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Competitor Dashboard | The Pitch Deck",
    description:
      "Manage your competition applications, track deadlines, and access your personalized opportunities dashboard.",
  },
};

export default function CompetitorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
