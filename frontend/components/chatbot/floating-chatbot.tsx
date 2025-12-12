"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type AuthUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: string;
};

const STORAGE_PREFIX = "tpd_chat_history_";
const MAX_HISTORY = 12;

const createMessage = (role: ChatRole, content: string): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  role,
  content,
});

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const memoryLabel = useMemo(
    () =>
      user?.email
        ? `Saved for ${user.firstName || "you"}`
        : "Guest session (local only)",
    [user?.email, user?.firstName],
  );

  const welcomeMessage = useCallback(
    () =>
      createMessage(
        "assistant",
        user?.firstName
          ? `Hey ${user.firstName}! I'm here with quick answers about opportunities, your dashboard, or site navigation. Ask me anything.`
          : "Hey there! I'm your PitchDeck copilot. Ask about opportunities, deadlines, or where to find things on the site.",
      ),
    [user?.firstName],
  );

  const hydrateFromStorage = useCallback(
    (key: string) => {
      if (typeof window === "undefined") return;

      try {
        const stored = window.localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored) as ChatMessage[];
          if (Array.isArray(parsed)) {
            setMessages(parsed);
            return;
          }
        }
      } catch {
        // ignore malformed storage
      }

      setMessages([welcomeMessage()]);
    },
    [welcomeMessage],
  );

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const data = await response.json();

        if (response.ok && data?.success && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    const key = `${STORAGE_PREFIX}${user?.email || "guest"}`;
    setStorageKey(key);
    hydrateFromStorage(key);
  }, [authChecked, user?.email, hydrateFromStorage]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined" || messages.length === 0)
      return;
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    setError(null);

    const userMessage = createMessage("user", input.trim());
    const history = [...messages, userMessage].slice(-MAX_HISTORY);
    setMessages(history);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          user,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.reply) {
        throw new Error(data?.error || "Chat request failed");
      }

      setMessages((prev) => [
        ...prev,
        createMessage("assistant", data.reply as string),
      ]);
    } catch (err) {
      setError("We couldn't reach the chatbot. Please try again.");
      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          "I ran into an issue talking to Grok. Give it another try in a moment.",
        ),
      ]);
      console.error("Chatbot send error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    if (!storageKey || typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey);
    setMessages([welcomeMessage()]);
  };

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("tpd-open-chatbot", handleOpen);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("tpd-open-chatbot", handleOpen);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-[70] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] overflow-hidden rounded-3xl border border-emerald-200/70 bg-white/95 shadow-2xl backdrop-blur dark:border-emerald-800/60 dark:bg-gray-900/95">
          <div className="flex items-start justify-between gap-2 border-b border-emerald-100/70 bg-gradient-to-r from-emerald-600/10 to-teal-500/10 px-4 py-3 dark:border-emerald-800/60 dark:from-emerald-900/50 dark:to-teal-900/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                PitchDeck Copilot
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" />
                Powered by Grok with on-page guidance
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/80 bg-white text-emerald-700 shadow-sm transition hover:scale-105 hover:text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-900/60 dark:text-emerald-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close chatbot</span>
            </button>
          </div>

          <div className="space-y-3 px-4 py-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100">
                {user?.email ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                {memoryLabel}
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-200"
              >
                New chat
              </button>
            </div>

            <div className="flex h-72 flex-col gap-3 overflow-y-auto rounded-2xl border border-emerald-50/80 bg-gradient-to-b from-white via-white/80 to-emerald-50/50 p-3 shadow-inner dark:border-emerald-800/50 dark:from-gray-900 dark:via-gray-900/80 dark:to-emerald-950/30">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "assistant"
                      ? "justify-start"
                      : "justify-end",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                      message.role === "assistant"
                        ? "border border-emerald-100/80 bg-white/90 text-gray-900 dark:border-emerald-800/70 dark:bg-emerald-950/70 dark:text-emerald-50"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Grok is thinking...
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="rounded-2xl border border-emerald-100 bg-white/80 p-2 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/60">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about opportunities, deadlines, or navigation..."
                className="min-h-[90px] bg-transparent text-sm"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 dark:text-gray-300">
                  Shift + Enter for a new line
                </span>
                <Button
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={handleSend}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-2xl transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        aria-label="Open chatbot"
      >
        <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md transition-opacity group-hover:opacity-70" />
        <MessageCircle className="h-6 w-6 relative z-10" />
        <span className="absolute -top-2 right-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-700 shadow-sm">
          AI
        </span>
      </button>
    </div>
  );
}
