"use client";

import type { ChatMessage } from "@/features/shared/contracts/ChatMessage";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const isSystem = message.role === "system";

        return (
          <article
            key={message.id}
            className={cn(
              "max-w-[88%] rounded-[1.4rem] px-4 py-3 text-sm leading-7 shadow-[0_16px_40px_rgba(2,6,15,0.28)]",
              isUser
                ? "ml-auto border border-[rgba(242,191,122,0.24)] bg-[rgba(242,191,122,0.12)] text-[var(--ov-text)]"
                : isSystem
                  ? "border border-dashed border-[rgba(124,170,255,0.16)] bg-[rgba(13,23,38,0.68)] text-[var(--ov-text-muted)]"
                  : "border border-[rgba(124,170,255,0.16)] bg-[rgba(19,32,51,0.82)] text-[var(--ov-text)]",
            )}
          >
            <p>{message.content}</p>
          </article>
        );
      })}
    </div>
  );
}
