import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Competitions - Find Your Next Challenge | The Pitch Deck",
  description:
    "Browse hundreds of case competitions from top universities and organizations worldwide. Filter by grade level, industry, and application deadlines.",
  keywords:
    "case competitions, business competitions, university competitions, consulting competitions, MBA competitions, undergraduate competitions, competition directory, business case challenges",
  openGraph: {
    title: "Case Competitions - Find Your Next Challenge | The Pitch Deck",
    description:
      "Browse hundreds of case competitions from top universities and organizations worldwide. Filter by grade level, industry, and application deadlines.",
    type: "website",
    url: "/competitions",
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Competitions - Find Your Next Challenge | The Pitch Deck",
    description:
      "Browse hundreds of case competitions from top universities and organizations worldwide. Filter by grade level, industry, and application deadlines.",
  },
};

export default function CompetitionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
