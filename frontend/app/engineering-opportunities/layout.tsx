import { buildPageMetadata } from "@/lib/seo/simple-metadata";

export const metadata = buildPageMetadata({
  title: "Engineering Opportunities & Competitions | The Pitch Deck",
  description:
    "Discover STEM challenges, design labs, engineering programs, and competitions for high school innovators.",
  keywords:
    "engineering opportunities, engineering competitions, STEM programs, robotics competitions, design challenges, engineering internships",
  url: "/engineering-opportunities",
});

export default function EngineeringOpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
