import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "High School Business Opportunities & Competitions | The Pitch Deck",
  description:
    "Discover high school programs, internships, and business competitions. Accelerate your career with curated business opportunities.",
  keywords:
    "business internships, summer programs, business competitions, entrepreneurship fellowships, business opportunities, startup internships, consulting internships",
  openGraph: {
    title:
      "High School Business Opportunities & Competitions | The Pitch Deck",
    description:
      "Discover high school programs, internships, and business competitions. Accelerate your career with curated business opportunities.",
    type: "website",
    url: "/business-opportunities",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "High School Business Opportunities & Competitions | The Pitch Deck",
    description:
      "Discover high school programs, internships, and business competitions. Accelerate your career with curated business opportunities.",
  },
};

export default function BusinessOpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
