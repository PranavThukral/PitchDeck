"use client";

import dynamic from "next/dynamic";

const FloatingChatbot = dynamic(
  () =>
    import("./floating-chatbot").then((module) => module.FloatingChatbot),
  { ssr: false },
);

export function FloatingChatbotLoader() {
  return <FloatingChatbot />;
}
