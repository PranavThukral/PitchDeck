import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { buildChatbotContext } from "@/lib/services/chatbot-retrieval";
import { buildChatbotRecommendationReply } from "@/lib/services/chatbot-recommendations";

type IncomingMessage = {
  role?: string;
  content?: string;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;

type RateEntry = {
  count: number;
  resetAt: number;
};

const rateLimiter = new Map<string, RateEntry>();
const MAX_CONTEXT = 12;
const MAX_CONTENT_LENGTH = 2000;
const DEFAULT_MODEL = "grok-4-1-fast-non-reasoning";

const sanitizeEnvValue = (value: string | undefined): string =>
  (value || "").trim().replace(/^["']|["']$/g, "");

export async function POST(request: NextRequest) {
  try {
    // NextRequest no longer exposes the client IP; the proxy's header does.
    const clientKey =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const now = Date.now();
    const entry = rateLimiter.get(clientKey);

    if (entry && entry.resetAt > now) {
      if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return NextResponse.json(
          {
            success: false,
            error: "Rate limit exceeded. Please wait a moment.",
          },
          { status: 429 },
        );
      }
      rateLimiter.set(clientKey, {
        count: entry.count + 1,
        resetAt: entry.resetAt,
      });
    } else {
      rateLimiter.set(clientKey, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    const rawBody = await request.text();
    let body: { messages?: IncomingMessage[] } = {};
    try {
      body = rawBody ? (JSON.parse(rawBody) as { messages?: IncomingMessage[] }) : {};
    } catch (error) {
      console.error("Chatbot request JSON parse failed:", error);
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const incoming: IncomingMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    const messages = incoming
      .filter(
        (message) =>
          typeof message?.content === "string" &&
          typeof message?.role === "string",
      )
      .slice(-MAX_CONTEXT)
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: (message.content || "").slice(0, MAX_CONTENT_LENGTH),
      }));

    const recommendationReply =
      await buildChatbotRecommendationReply(messages);
    if (recommendationReply) {
      return NextResponse.json({ success: true, reply: recommendationReply });
    }

    const lastUserMessage =
      [...messages].reverse().find((message) => message.role === "user")
        ?.content || "";
    const context = await buildChatbotContext(lastUserMessage);

    const authResult = await verifyAuth(request);
    const user = authResult.success && authResult.user ? authResult.user : null;

    const apiKey = sanitizeEnvValue(process.env.GROK_API_KEY);
    const model = sanitizeEnvValue(process.env.GROK_MODEL) || DEFAULT_MODEL;
    if (!apiKey) {
      console.error("Missing GROK_API_KEY");
      return NextResponse.json(
        { success: false, error: "Missing GROK_API_KEY" },
        { status: 500 },
      );
    }

    const systemPrompt = `
      You are PitchDeck's respectful, kind, and concise assistant. ONLY answer questions related to The Pitch Deck platform: opportunities, competitions, deadlines, navigation, accounts, and onboarding. If asked about unrelated topics, politely decline and guide the user back to PitchDeck topics.
      User status: ${user ? `logged in as ${user.firstName || "member"} (${user.userType})` : "guest (not logged in)"}.
      Keep responses short, actionable, and supportive. Never expose private data. If unsure, be honest and suggest where to look on the site.
    `.trim();
    const systemContext = context
      ? `Site context (use this to answer accurately):\n${context}`
      : "";

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...(systemContext ? [{ role: "system", content: systemContext }] : []),
          ...messages,
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", errorText);
      return NextResponse.json(
        { success: false, error: "Grok request failed" },
        { status: response.status },
      );
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "I could not find an answer. Please try again.";

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("Chatbot route error:", error);
    return NextResponse.json(
      { success: false, error: "Chatbot request failed" },
      { status: 500 },
    );
  }
}
