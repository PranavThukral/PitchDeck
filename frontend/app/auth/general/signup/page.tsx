"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Users, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function GeneralSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
    grade: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 4) {
      toast.error("Password must be at least 4 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/general/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          userType: "general",
          school: formData.school,
          grade: formData.grade,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Account created successfully! Welcome to The Pitch Deck.",
        );
        router.push("/dashboard/general");
      } else {
        toast.error(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
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
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold font-serif text-center">
              Create Student Account
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Join The Pitch Deck to discover competitions and opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                    disabled={isLoading}
                    className="border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                    disabled={isLoading}
                    className="border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@example.com"
                  required
                  disabled={isLoading}
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School/University</Label>
                <Input
                  id="school"
                  name="school"
                  type="text"
                  value={formData.school}
                  onChange={handleInputChange}
                  placeholder="Your School Name"
                  required
                  disabled={isLoading}
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade Level</Label>
                <Select
                  disabled={isLoading}
                  onValueChange={(value) => handleSelectChange("grade", value)}
                  required
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
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
                    placeholder="Create a strong password"
                    required
                    disabled={isLoading}
                    className="border-gray-300 dark:border-gray-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Password must be at least 4 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/auth/general/login"
                  className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Sign in here
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

              <p className="text-xs text-gray-500 mt-4">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-gray-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-gray-700">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
