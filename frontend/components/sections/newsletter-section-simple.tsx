"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterSectionSimple() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Simple newsletter form submitted");
    console.log("Email:", email);

    if (!email || !email.trim()) {
      console.log("No email provided");
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    console.log("Starting API request...");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      console.log("Response received:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        toast.success("Successfully subscribed!");
        setEmail("");
        console.log("Success - email cleared");
      } else {
        toast.error(data.error || "Subscription failed");
        console.log("Error:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error - please try again");
    } finally {
      setIsLoading(false);
      console.log("Request completed");
    }
  };

  return (
    <section className="py-16 px-4 bg-green-600 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
        <p className="text-xl mb-8">
          Get notified about Canada's best high school opportunities.
        </p>

        <div className="bg-white/10 p-6 rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                console.log("Email changed:", e.target.value);
                setEmail(e.target.value);
              }}
              placeholder="Enter your email address"
              required
              className="w-full px-4 py-3 rounded-lg text-black"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full bg-green-800 hover:bg-green-900 text-white py-3 px-6 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Subscribing..." : "Subscribe Now"}
            </button>
          </form>

          <div className="mt-4 text-sm text-white/80">
            Test form - check console for debug info
          </div>
        </div>
      </div>
    </section>
  );
}
