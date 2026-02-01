import { buildPageMetadata } from "@/lib/seo/simple-metadata";

export const metadata = buildPageMetadata({
  title: "High School Business Opportunities & Competitions | The Pitch Deck",
  description:
    "Discover high school programs, internships, and business competitions. Accelerate your career with curated business opportunities.",
  keywords:
    "business internships, summer programs, business competitions, entrepreneurship fellowships, business opportunities, startup internships, consulting internships",
  url: "/business-opportunities",
});

export default function BusinessOpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
