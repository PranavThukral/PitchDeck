"use client";

import { useState } from "react";

export default function FormTestPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted with email:", email);

    setIsLoading(true);
    setResult("Submitting...");

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

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok && data.success) {
        setResult(`SUCCESS: ${data.message}`);
        setEmail("");
      } else {
        setResult(`ERROR: ${data.error || "Failed"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setResult(`NETWORK ERROR: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-4">Minimal Form Test</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
          >
            {isLoading ? "Submitting..." : "Subscribe"}
          </button>
        </form>

        {result && (
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <strong>Result:</strong> {result}
          </div>
        )}
      </div>
    </div>
  );
}
