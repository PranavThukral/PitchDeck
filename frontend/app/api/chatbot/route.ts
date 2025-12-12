import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";

type IncomingMessage = {
  role?: string;
  content?: string;
};

const MODEL = process.env.GROK_MODEL || "grok-2";
const MAX_CONTEXT = 12;
const MAX_CONTENT_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    const authResult = await verifyAuth(request);
    const user = authResult.success && authResult.user ? authResult.user : null;

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing GROK_API_KEY" },
        { status: 500 },
      );
    }

    const systemPrompt = `
      You are PitchDeck's helpful assistant. Keep answers concise, actionable, and relevant to The Pitch Deck platform (student opportunities, competitions, onboarding, navigation).
      User status: ${user ? `logged in as ${user.firstName || "member"} (${user.userType})` : "guest (not logged in)"}.
      Use the conversation history to maintain context. Never expose private data. If you do not know the answer, be honest and suggest where to look in the site.
    `.trim();

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
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
