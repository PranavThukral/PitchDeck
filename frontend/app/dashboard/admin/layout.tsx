import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | The Pitch Deck",
  description:
    "Access administrative controls, manage users, competitions, and platform settings through your admin dashboard.",
  keywords: "admin dashboard, platform management, user management, admin portal, system administration",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Admin Dashboard | The Pitch Deck",
    description:
      "Access administrative controls, manage users, competitions, and platform settings through your admin dashboard.",
    type: "website",
    url: "/dashboard/admin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Admin Dashboard | The Pitch Deck",
    description:
      "Access administrative controls, manage users, competitions, and platform settings through your admin dashboard.",
  },
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
