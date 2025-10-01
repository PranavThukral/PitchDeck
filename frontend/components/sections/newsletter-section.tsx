"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react"; // Using a 'Users' icon for the Discord community
import { toast } from "sonner";
import {
  AnimatedElement,
  AnimatedText,
  FloatingElements,
  ParallaxElement,
} from "@/components/animations";
import { motion } from "framer-motion";
import Link from "next/link";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("=== FORM SUBMIT HANDLER CALLED ===");
    console.log("Event type:", e.type);
    console.log("Target:", e.target);
    console.log("Current target:", e.currentTarget);

    e.preventDefault();
    console.log("preventDefault() called");
    console.log("Newsletter form submitted with email:", email);
    console.log("Current isLoading state:", isLoading);

    if (!email || !email.trim()) {
      console.log("Email is empty, stopping submission");
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    console.log("Set isLoading to true");

    try {
      console.log("Making API request to /api/newsletter/subscribe");
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      console.log("API response received - status:", response.status);

      const data = await response.json();
      console.log("API response data:", data);

      if (response.ok && data.success) {
        console.log("Success! Showing success toast");
        toast.success(data.message, {
          description:
            "You'll receive updates about new competitions and opportunities.",
        });
        setEmail("");
        console.log("Email cleared");
      } else {
        console.log("API returned error:", data.error);
        toast.error(data.error || "Subscription failed", {
          description: "Please check your email and try again.",
        });
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      console.error("Error details:", error);
      toast.error("Subscription failed", {
        description: "Please check your internet connection and try again.",
      });
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#19613F] dark:bg-[#102338] dark:text-white relative overflow-hidden">
      <FloatingElements count={15} minSize={10} maxSize={80} />

      <ParallaxElement speed={0.4} className="absolute inset-0">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/newsletter-bg.jpg')] bg-cover bg-center mix-blend-overlay"></div>
      </ParallaxElement>

      {/* Background animated shapes are unchanged */}
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#2CA15F]/20 blur-3xl -translate-y-1/2 translate-x-1/3"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      ></motion.div>
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#2CA15F]/10 blur-3xl translate-y-1/3 -translate-x-1/4"
        animate={{ scale: [1, 0.8, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      ></motion.div>

      <AnimatedElement
        animation="slideUp"
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        {/* Mail Icon has been removed from here */}

        <AnimatedElement animation="slideUp" delay={0.3}>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-6 drop-shadow-sm">
            <AnimatedText
              text="Stay Connected" // Heading text changed
              animation="wordByWord"
              staggerChildren={0.1}
            />
          </div>
        </AnimatedElement>
        <AnimatedElement animation="fadeIn" delay={0.6}>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            {/* Subheading text changed */}
            Get notified about Canada&apos;s best high school opportunities,
            exclusive professional opportunities, and gain a network of
            ambitious peers.
          </p>
        </AnimatedElement>

        {/* Simplified form structure for debugging */}
        <div className="max-w-2xl mx-auto bg-white/10 p-5 rounded-xl backdrop-blur-sm border border-white/20 shadow-xl relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  console.log("Email input changed:", e.target.value);
                  setEmail(e.target.value);
                }}
                required
                className="flex-1 bg-white/90 border-0 focus:border-0 focus-visible:ring-2 focus-visible:ring-[#2CA15F] focus-visible:ring-offset-1 dark:bg-[#1a3047]/90 dark:text-white rounded-lg h-12"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#2CA15F] text-white hover:bg-[#19613F] shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg font-medium h-12 px-6 dark:shadow-[0_0_15px_rgba(44,161,95,0.4)]"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </form>

          {/* Discord button below form */}
          <div className="mt-4 flex justify-center">
            <Link
              href="https://discord.gg/fXpU4Xbyy5"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-12 px-6 bg-white/90 text-[#19613F] hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg font-medium"
            >
              <Users className="h-5 w-5 mr-2" />
              Join our Discord
            </Link>
          </div>
        </div>

        {/* Privacy notice has been removed */}
      </AnimatedElement>
    </section>
  );
}
