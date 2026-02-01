import { buildPageMetadata } from "@/lib/seo/simple-metadata";

export const metadata = buildPageMetadata({
  title: "Case Competitions - Find Your Next Challenge | The Pitch Deck",
  description:
    "Browse hundreds of case competitions from top universities and organizations worldwide. Filter by grade level, industry, and application deadlines.",
  keywords:
    "case competitions, business competitions, university competitions, consulting competitions, MBA competitions, undergraduate competitions, competition directory, business case challenges",
  url: "/competitions",
});

export default function CompetitionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
