import { buildPageMetadata } from "@/lib/seo/simple-metadata";

export const metadata = buildPageMetadata({
  title: "Apply to Competitions | The Pitch Deck",
  description:
    "Submit your application and pitch deck to join exciting case competitions. Get discovered by top organizations and showcase your business acumen.",
  keywords:
    "apply competition, pitch deck submission, competition application, business case application, startup pitch, competition entry",
  url: "/apply",
});

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
