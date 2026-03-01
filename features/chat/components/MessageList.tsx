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
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm",
              isUser
                ? "ml-auto bg-primary text-primary-foreground"
                : isSystem
                  ? "border border-dashed border-border bg-muted/50 text-muted-foreground"
                  : "bg-secondary text-secondary-foreground",
            )}
          >
            <p>{message.content}</p>
          </article>
        );
      })}
    </div>
  );
}
