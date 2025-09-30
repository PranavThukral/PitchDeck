import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizer Dashboard | The Pitch Deck",
  description:
    "Manage your competitions, review applications, and organize events through your organizer dashboard.",
  keywords: "organizer dashboard, competition management, event organization, admin portal",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Organizer Dashboard | The Pitch Deck",
    description:
      "Manage your competitions, review applications, and organize events through your organizer dashboard.",
    type: "website",
    url: "/dashboard/organizer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organizer Dashboard | The Pitch Deck",
    description:
      "Manage your competitions, review applications, and organize events through your organizer dashboard.",
  },
};

export default function OrganizerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
