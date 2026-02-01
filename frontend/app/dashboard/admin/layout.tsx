import { buildPageMetadata } from "@/lib/seo/simple-metadata";

export const metadata = buildPageMetadata({
  title: "Admin Dashboard | The Pitch Deck",
  description:
    "Access administrative controls, manage users, competitions, and platform settings through your admin dashboard.",
  keywords:
    "admin dashboard, platform management, user management, admin portal, system administration",
  robots: "noindex, nofollow",
  url: "/dashboard/admin",
});

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
