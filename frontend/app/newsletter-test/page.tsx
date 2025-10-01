"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewsletterTestPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [logMessage, ...prev]);
  };

  const testAPIEndpoint = async () => {
    addLog("Testing API endpoint availability...");
    try {
      const response = await fetch("/api/newsletter/test");
      const data = await response.json();
      addLog(`Test endpoint response: ${JSON.stringify(data)}`);
      setResponse(data);
    } catch (error) {
      addLog(`Test endpoint error: ${error}`);
      setResponse({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  };

  const testNewsletterAPI = async () => {
    if (!email) {
      addLog("Please enter an email address");
      return;
    }

    addLog(`Testing newsletter subscription with email: ${email}`);
    setIsLoading(true);

    try {
      addLog("Making POST request to /api/newsletter/test");
      const testResponse = await fetch("/api/newsletter/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const testData = await testResponse.json();
      addLog(`Test API response: ${JSON.stringify(testData)}`);

      if (testData.success && testData.apiConnectivity?.accessible) {
        addLog("API connectivity test passed, trying actual subscription...");

        const subscribeResponse = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        });

        addLog(`Subscribe response status: ${subscribeResponse.status}`);
        const subscribeData = await subscribeResponse.json();
        addLog(`Subscribe response data: ${JSON.stringify(subscribeData)}`);
        setResponse(subscribeData);
      } else {
        setResponse(testData);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      addLog(`Error during newsletter test: ${errorMsg}`);
      setResponse({ error: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addLog("Form submitted directly");

    if (!email) {
      addLog("Email is required");
      return;
    }

    setIsLoading(true);
    addLog(`Submitting email: ${email}`);

    try {
      addLog("Making direct API call to /api/newsletter/subscribe");
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      addLog(`Response received - Status: ${response.status}`);

      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        addLog(`Response data: ${JSON.stringify(data, null, 2)}`);
        setResponse(data);
      } else {
        const text = await response.text();
        addLog(`Non-JSON response: ${text}`);
        setResponse({ error: "Received non-JSON response", response: text });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      addLog(`Direct submit error: ${errorMsg}`);
      setResponse({ error: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setResponse(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Newsletter API Debug Page</CardTitle>
            <p className="text-sm text-gray-600">
              Use this page to debug newsletter subscription issues
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Test Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button onClick={clearLogs} variant="outline">
                Clear Logs
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={testAPIEndpoint} variant="secondary">
                Test API Endpoint
              </Button>
              <Button onClick={testNewsletterAPI} disabled={!email || isLoading}>
                Test Newsletter API
              </Button>
            </div>

            <form onSubmit={handleDirectSubmit} className="border-t pt-4">
              <Button
                type="submit"
                disabled={!email || isLoading}
                className="w-full"
              >
                {isLoading ? "Testing..." : "Direct Form Submit Test"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
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
                <span>Node Environment:</span>
                <code>{process.env.NODE_ENV}</code>
              </div>
              <div className="flex justify-between">
                <span>Current URL:</span>
                <code>{typeof window !== 'undefined' ? window.location.href : 'SSR'}</code>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                <p>
                  <strong>Instructions:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>First click "Test API Endpoint" to check if the API route is accessible</li>
                  <li>Enter a test email and click "Test Newsletter API" to test MailerLite connectivity</li>
                  <li>Use "Direct Form Submit Test" to simulate the actual form submission</li>
                  <li>Check the debug logs and browser console for detailed error information</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
