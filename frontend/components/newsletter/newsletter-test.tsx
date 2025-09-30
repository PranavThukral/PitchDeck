"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { subscribeToNewsletter, validateEmail } from "@/lib/newsletter";
import { toast } from "sonner";
import { CheckCircle, XCircle, Mail, User, Loader2 } from "lucide-react";

/**
 * Newsletter Test Component
 *
 * This component is for testing the newsletter integration during development.
 * It provides a simple interface to test newsletter subscriptions and view responses.
 *
 * Usage: Import and add to a test page or development environment only.
 */
export function NewsletterTest() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [testResults, setTestResults] = useState<Array<{
    email: string;
    success: boolean;
    message: string;
    timestamp: string;
  }>>([]);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await subscribeToNewsletter(email, name || undefined);
      setLastResponse(response);

      // Add to test results
      const testResult = {
        email,
        success: response.success,
        message: response.message,
        timestamp: new Date().toLocaleString(),
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results

      if (response.success) {
        toast.success("Test Successful!", {
          description: response.message,
        });
        setEmail("");
        setName("");
      } else {
        toast.error("Test Failed", {
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Test error:", error);
      toast.error("Test Error", {
        description: "An unexpected error occurred during testing",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTest = async (testEmail: string) => {
    setEmail(testEmail);
    setName("Test User");

    // Trigger test after a short delay to allow state to update
    setTimeout(() => {
      const form = document.querySelector('#newsletter-test-form') as HTMLFormElement;
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  const isValidEmail = validateEmail(email);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Newsletter Integration Test
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test the MailerLite newsletter subscription functionality. Make sure MAILERLITE_API_KEY is set in your environment.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form id="newsletter-test-form" onSubmit={handleTest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="test-email" className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {email && !isValidEmail && (
                  <p className="text-sm text-red-500 mt-1">Please enter a valid email address</p>
                )}
              </div>

              <div>
                <label htmlFor="test-name" className="block text-sm font-medium mb-2">
                  Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="test-name"
                    type="text"
                    placeholder="Test User"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isValidEmail}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Newsletter Subscription"
              )}
            </Button>
          </form>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Quick Test Options:</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickTest("test@example.com")}
                disabled={isLoading}
              >
                Test with example.com
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickTest("user@gmail.com")}
                disabled={isLoading}
              >
                Test with Gmail
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickTest("invalid-email")}
                disabled={isLoading}
              >
                Test Invalid Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {lastResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastResponse.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Last Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={lastResponse.success ? "default" : "destructive"}>
                  {lastResponse.success ? "Success" : "Failed"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{lastResponse.message}</p>
              {lastResponse.subscriber && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <p><strong>Email:</strong> {lastResponse.subscriber.email}</p>
                  <p><strong>Status:</strong> {lastResponse.subscriber.status}</p>
                  {lastResponse.subscriber.name && (
                    <p><strong>Name:</strong> {lastResponse.subscriber.name}</p>
                  )}
                </div>
              )}
              {lastResponse.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <strong>Error:</strong> {lastResponse.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test History</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recent test results (last 10)
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-mono">{result.email}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">{result.timestamp}</p>
                    <p className={result.success ? "text-green-600" : "text-red-600"}>
                      {result.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {testResults.length === 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing last 10 results. Older results are automatically removed.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Environment:</span>
              <Badge variant="outline">{process.env.NODE_ENV}</Badge>
            </div>
            <div className="flex justify-between">
              <span>API Endpoint:</span>
              <code className="text-xs bg-muted px-1 rounded">/api/newsletter/subscribe</code>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              <p>
                <strong>Note:</strong> This test component should only be used in development.
                Make sure your MAILERLITE_API_KEY environment variable is properly configured.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
