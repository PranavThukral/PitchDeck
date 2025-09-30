import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply to Competitions | The Pitch Deck",
  description:
    "Submit your application and pitch deck to join exciting case competitions. Get discovered by top organizations and showcase your business acumen.",
  keywords:
    "apply competition, pitch deck submission, competition application, business case application, startup pitch, competition entry",
  openGraph: {
    title: "Apply to Competitions | The Pitch Deck",
    description:
      "Submit your application and pitch deck to join exciting case competitions. Get discovered by top organizations and showcase your business acumen.",
    type: "website",
    url: "/apply",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apply to Competitions | The Pitch Deck",
    description:
      "Submit your application and pitch deck to join exciting case competitions. Get discovered by top organizations and showcase your business acumen.",
  },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
