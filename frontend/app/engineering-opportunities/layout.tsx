import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Opportunities & Competitions | The Pitch Deck",
  description:
    "Discover STEM challenges, design labs, engineering programs, and competitions for high school innovators.",
  keywords:
    "engineering opportunities, engineering competitions, STEM programs, robotics competitions, design challenges, engineering internships",
  openGraph: {
    title: "Engineering Opportunities & Competitions | The Pitch Deck",
    description:
      "Discover STEM challenges, design labs, engineering programs, and competitions for high school innovators.",
    type: "website",
    url: "/engineering-opportunities",
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Opportunities & Competitions | The Pitch Deck",
    description:
      "Discover STEM challenges, design labs, engineering programs, and competitions for high school innovators.",
  },
};

export default function EngineeringOpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
