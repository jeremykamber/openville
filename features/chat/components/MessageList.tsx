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
              "max-w-[88%] rounded-[1.4rem] px-4 py-3 text-sm leading-7 shadow-[0_16px_40px_var(--ov-shadow)]",
              isUser
                ? "ml-auto border border-[var(--ov-human-border)] bg-[var(--ov-human-bg)] text-[var(--ov-text)]"
                : isSystem
                  ? "border border-dashed border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] text-[var(--ov-text-muted)]"
                  : "border border-[var(--ov-border-medium)] bg-[var(--ov-surface-1)] text-[var(--ov-text)]",
            )}
          >
            <p>{message.content}</p>
          </article>
        );
      })}
    </div>
  );
}
