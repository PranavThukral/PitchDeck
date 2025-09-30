import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Business Opportunities - Internships, Programs & More | The Pitch Deck",
  description:
    "Discover summer programs, internships, fellowships, and entrepreneurial opportunities. Accelerate your career with curated business opportunities.",
  keywords:
    "business internships, summer programs, entrepreneurship fellowships, business opportunities, startup internships, consulting internships, MBA programs, business development programs",
  openGraph: {
    title:
      "Business Opportunities - Internships, Programs & More | The Pitch Deck",
    description:
      "Discover summer programs, internships, fellowships, and entrepreneurial opportunities. Accelerate your career with curated business opportunities.",
    type: "website",
    url: "/business-opportunities",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Business Opportunities - Internships, Programs & More | The Pitch Deck",
    description:
      "Discover summer programs, internships, fellowships, and entrepreneurial opportunities. Accelerate your career with curated business opportunities.",
  },
};

export default function BusinessOpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
