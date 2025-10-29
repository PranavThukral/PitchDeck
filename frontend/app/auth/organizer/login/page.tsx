"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Building, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OrganizerLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/organizer/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Login successful! Welcome back organizer.");
        router.push("/dashboard/organizer");
      } else {
        toast.error(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] dark:bg-gradient-to-br dark:from-[#102338] dark:via-[#152a45] dark:to-[#193252] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10">
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
        </div>

        <Card className="border-[#19613F]/20 dark:border-[#2CA15F]/30 dark:bg-gray-900/90 dark:backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold font-serif text-center">
              Organizer Login
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Sign in to manage your competitions and opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="border-gray-300 dark:border-gray-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/organizer/signup"
                  className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  Sign up here
                </Link>
              </p>

              <div className="flex items-center justify-center space-x-4 text-sm">
                <Link
                  href="/auth/login-select"
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ← Different account type?
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
