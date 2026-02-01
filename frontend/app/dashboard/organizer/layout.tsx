import { buildPageMetadata } from "@/lib/seo/simple-metadata";

export const metadata = buildPageMetadata({
  title: "Organizer Dashboard | The Pitch Deck",
  description:
    "Manage your competitions, review applications, and organize events through your organizer dashboard.",
  keywords:
    "organizer dashboard, competition management, event organization, admin portal",
  robots: "noindex, nofollow",
  url: "/dashboard/organizer",
});

export default function OrganizerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
