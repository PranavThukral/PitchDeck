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
    e.preventDefault();
    console.log("Newsletter form submitted with email:", email);
    setIsLoading(true);

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

      console.log("API response status:", response.status);

      const data = await response.json();
      console.log("API response data:", data);

      if (response.ok && data.success) {
        toast.success(data.message, {
          description:
            "You'll receive updates about new competitions and opportunities.",
        });
        setEmail("");
      } else {
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

        <AnimatedElement animation="zoom" delay={0.8}>
          {/* Form and button container updated */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto bg-white/10 p-5 rounded-xl backdrop-blur-sm border border-white/20 shadow-xl relative z-10">
            {/* Left side: Email form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-1 items-center gap-2"
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/90 border-0 focus:border-0 focus-visible:ring-2 focus-visible:ring-[#2CA15F] focus-visible:ring-offset-1 dark:bg-[#1a3047]/90 dark:text-white rounded-lg h-12"
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="secondary"
                  className="bg-[#2CA15F] text-white hover:bg-[#19613F] shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg font-medium h-12 px-6 dark:shadow-[0_0_15px_rgba(44,161,95,0.4)]"
                >
                  {isLoading ? (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      Subscribing...
                    </motion.span>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Right side: Discord button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="https://discord.gg/fXpU4Xbyy5"
                passHref
                legacyBehavior
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-12 px-6 bg-white/90 text-[#19613F] hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg font-medium w-full sm:w-auto"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Join our Discord
                </a>
              </Link>
            </motion.div>
          </div>
        </AnimatedElement>

        {/* Privacy notice has been removed */}
      </AnimatedElement>
    </section>
  );
}
