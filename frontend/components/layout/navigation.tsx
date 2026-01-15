"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Trophy,
  Building,
  Shield,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  userType: "general" | "organizer" | "admin";
  school?: string;
  grade?: string;
  organization?: string;
  position?: string;
  approved: boolean;
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });

      if (response.data.success) {
        setIsLoggedIn(true);
        setUser(response.data.user);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setIsLoggedIn(false);
      setUser(null);
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const getDashboardLink = (userType: string) => {
    switch (userType) {
      case "general":
        return "/dashboard/general";
      case "organizer":
        return "/dashboard/organizer";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/dashboard/general";
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "general":
        return <Users className="h-4 w-4" />;
      case "organizer":
        return <Building className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "general":
        return "Student";
      case "organizer":
        return "Organizer";
      case "admin":
        return "Admin";
      default:
        return "User";
    }
  };

  const ThemeToggle = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-8 w-8 px-0"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );

  return (
    <nav className="fixed top-0 w-full bg-[#D9D9D9]/90 backdrop-blur-md z-50 border-b border-[#19613F]/20 dark:bg-gray-900/80 dark:border-[#2CA15F]/30 dark:text-white">
      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-3">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2"
              passHref
              legacyBehavior
            >
              <a className="flex items-center space-x-2">
                <Image
                  src="/images/logo2.png"
                  alt="TPD Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="font-bold text-xl font-serif gradient-text">
                  The Pitch Deck
                </span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-baseline space-x-3">
              <Link
                href="/business-opportunities"
                className="text-black hover:text-[#2CA15F] px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors dark:text-white"
              >
                Business
              </Link>
              <Link
                href="/medicine-opportunities"
                className="text-black hover:text-[#2CA15F] px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors dark:text-white"
              >
                Medicine
              </Link>
              <Link
                href="/engineering-opportunities"
                className="text-black hover:text-[#2CA15F] px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors dark:text-white"
              >
                Engineering
              </Link>
              <Link
                href="/our-story"
                className="text-black hover:text-[#2CA15F] px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors dark:text-white"
              >
                Our Story
              </Link>

              <Link
                href="/findyouropp"
                className="relative text-black hover:text-[#2CA15F] px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors dark:text-white"
              >
                Find Your Opportunity
                <span className="absolute -top-2 -right-2 flex h-5 w-10 items-center justify-center rounded-full bg-yellow-400 p-1 text-xs font-bold text-yellow-900 animate-pulse">
                  NEW!
                </span>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />

            {!loading && (
              <>
                {isLoggedIn && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 h-9 px-3"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#19613F] dark:bg-[#2CA15F] text-white">
                          {getUserTypeIcon(user.userType)}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-black dark:text-white">
                            {user.firstName}
                          </span>
                          <span className="text-xs text-[#19613F] dark:text-[#2CA15F]">
                            {getUserTypeLabel(user.userType)}
                          </span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center space-x-2 p-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#19613F] dark:bg-[#2CA15F] text-white">
                          {getUserTypeIcon(user.userType)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={getDashboardLink(user.userType)}
                          className="flex items-center space-x-2"
                        >
                          <Trophy className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      {user.userType === "organizer" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/create/competition"
                              className="flex items-center space-x-2"
                            >
                              <Trophy className="h-4 w-4" />
                              <span>Create Competition</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/create/business-opportunity"
                              className="flex items-center space-x-2"
                            >
                              <Building className="h-4 w-4" />
                              <span>Create Opportunity</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/auth/login-select">Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="bg-[#19613F] hover:bg-[#2CA15F] text-white"
                    >
                      <Link href="/auth/login-select">Get Started</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-[#2CA15F] hover:bg-[#D9D9D9] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#19613F] dark:text-white"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#D9D9D9] border-b border-[#19613F]/20 dark:bg-gray-900">
            <Link
              href="/findyouropp"
              className="relative text-green-700 bg-green-100 block px-3 py-2 rounded-md text-base font-bold dark:bg-green-800 dark:text-white"
            >
              Find Your Opportunity
            </Link>

            <Link
              href="/business-opportunities"
              className="text-black hover:text-[#2CA15F] block px-3 py-2 rounded-md text-base font-medium dark:text-white"
            >
              Business
            </Link>
            <Link
              href="/medicine-opportunities"
              className="text-black hover:text-[#2CA15F] block px-3 py-2 rounded-md text-base font-medium dark:text-white"
            >
              Medicine
            </Link>
            <Link
              href="/engineering-opportunities"
              className="text-black hover:text-[#2CA15F] block px-3 py-2 rounded-md text-base font-medium dark:text-white"
            >
              Engineering
            </Link>
            <Link
              href="/our-story"
              className="text-black hover:text-[#2CA15F] block px-3 py-2 rounded-md text-base font-medium dark:text-white"
            >
              Our Story
            </Link>

            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center justify-between px-3">
                <ThemeToggle />

                {!loading && (
                  <>
                    {isLoggedIn && user ? (
                      <div className="flex flex-col space-y-2 w-full ml-4">
                        <div className="flex items-center space-x-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#19613F] dark:bg-[#2CA15F] text-white">
                            {getUserTypeIcon(user.userType)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getUserTypeLabel(user.userType)}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={getDashboardLink(user.userType)}
                          className="block px-3 py-2 rounded-md text-base font-medium text-[#19613F] hover:text-[#2CA15F] dark:text-[#2CA15F]"
                          onClick={() => setIsOpen(false)}
                        >
                          Dashboard
                        </Link>
                        {user.userType === "organizer" && (
                          <>
                            <Link
                              href="/create/competition"
                              className="block px-3 py-2 rounded-md text-base font-medium text-[#19613F] hover:text-[#2CA15F] dark:text-[#2CA15F]"
                              onClick={() => setIsOpen(false)}
                            >
                              Create Competition
                            </Link>
                            <Link
                              href="/create/business-opportunity"
                              className="block px-3 py-2 rounded-md text-base font-medium text-[#19613F] hover:text-[#2CA15F] dark:text-[#2CA15F]"
                              onClick={() => setIsOpen(false)}
                            >
                              Create Opportunity
                            </Link>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start text-red-600 hover:text-red-700"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2 w-full ml-4">
                        <Link
                          href="/auth/login-select"
                          className="block px-3 py-2 rounded-md text-base font-medium text-[#19613F] hover:text-[#2CA15F] dark:text-[#2CA15F]"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth/login-select"
                          className="block px-3 py-2 rounded-md text-base font-medium bg-[#19613F] text-white hover:bg-[#2CA15F]"
                          onClick={() => setIsOpen(false)}
                        >
                          Get Started
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
