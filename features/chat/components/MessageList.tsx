"use client";

import { AnimatePresence, motion } from "motion/react";

import type { ChatMessage } from "@/features/shared/contracts/ChatMessage";
import { cn } from "@/lib/utils";

// ── Motion config ────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const listContainer = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const messageItem = {
  hidden: { opacity: 0, y: 14, scale: 0.97, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(3px)",
    transition: { duration: 0.25, ease: EASE },
  },
};

// ── Component ────────────────────────────────────────────────────────────────

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <motion.div
      variants={listContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3"
      role="log"
      aria-label="Conversation messages"
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message) => {
          const isUser = message.role === "user";
          const isSystem = message.role === "system";

          return (
            <motion.article
              key={message.id}
              variants={messageItem}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
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
            </motion.article>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
