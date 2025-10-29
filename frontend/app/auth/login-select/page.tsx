import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Building, Shield } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Choose Your Account Type | The Pitch Deck",
  description: "Select your account type to access your dashboard - Student, Organizer, or Admin.",
  keywords: "login, account type, student, organizer, admin",
  robots: "noindex, nofollow",
};

export default function LoginSelectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] dark:bg-gradient-to-br dark:from-[#102338] dark:via-[#152a45] dark:to-[#193252] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-10">
        <div className="text-center">
          <Link
            href="/"
            className="flex items-center justify-center space-x-3 mb-8"
          >
            <Trophy className="h-9 w-9 text-[#19613F] dark:text-[#2CA15F]" />
            <span className="font-bold text-xl font-serif gradient-text">
              The Pitch Deck
            </span>
          </Link>
          <h1 className="text-3xl font-bold font-serif mb-4">Choose Your Login Type</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Select the type of account you want to access
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* General User Login */}
          <Card className="border-[#19613F]/20 dark:border-[#2CA15F]/30 dark:bg-gray-900/90 dark:backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl font-serif">Student Login</CardTitle>
              <CardDescription className="text-sm">
                Access your dashboard to browse and save competitions and business opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2">
                <li>• Browse competitions and opportunities</li>
                <li>• Save favorites to your profile</li>
                <li>• Track application deadlines</li>
                <li>• Access personalized recommendations</li>
              </ul>
              <Link href="/auth/general/login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Student Login
                </Button>
              </Link>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  New student?{" "}
                  <Link
                    href="/auth/general/signup"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Login */}
          <Card className="border-[#19613F]/20 dark:border-[#2CA15F]/30 dark:bg-gray-900/90 dark:backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl font-serif">Organizer Login</CardTitle>
              <CardDescription className="text-sm">
                Submit and manage your competitions and business opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2">
                <li>• Submit new competitions</li>
                <li>• Post business opportunities</li>
                <li>• Track submission status</li>
                <li>• Manage your listings</li>
              </ul>
              <Link href="/auth/organizer/login" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Organizer Login
                </Button>
              </Link>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  New organizer?{" "}
                  <Link
                    href="/auth/organizer/signup"
                    className="text-green-600 hover:text-green-700 dark:text-green-400"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Login */}
          <Card className="border-[#19613F]/20 dark:border-[#2CA15F]/30 dark:bg-gray-900/90 dark:backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl font-serif">Admin Login</CardTitle>
              <CardDescription className="text-sm">
                Review and approve submissions before they go live
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2">
                <li>• Review pending submissions</li>
                <li>• Approve or reject listings</li>
                <li>• Manage platform content</li>
                <li>• Monitor system activity</li>
              </ul>
              <Link href="/auth/admin/login" className="block">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Admin Login
                </Button>
              </Link>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Admin access only
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
