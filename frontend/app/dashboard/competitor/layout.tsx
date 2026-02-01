import { buildPageMetadata } from "@/lib/seo/simple-metadata";

export const metadata = buildPageMetadata({
  title: "Competitor Dashboard | The Pitch Deck",
  description:
    "Manage your competition applications, track deadlines, and access your personalized opportunities dashboard.",
  keywords:
    "dashboard, my applications, competition tracker, competitor portal",
  robots: "noindex, nofollow",
  url: "/dashboard/competitor",
});

export default function CompetitorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
