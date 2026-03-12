"use client";

import { cn } from "@/lib/utils";
import type { NegotiationThreadViewModel } from "@/features/workflow/client/types";

type ThreadLoadStatus = "idle" | "loading" | "success" | "not_found" | "error";

interface NegotiationThreadInspectorProps {
  status: ThreadLoadStatus;
  thread: NegotiationThreadViewModel | null;
  error: string | null;
  onRetry?: () => void;
}

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function NegotiationThreadInspector({
  status,
  thread,
  error,
  onRetry,
}: NegotiationThreadInspectorProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
          Negotiation thread
        </p>
        {thread && (
          <span className="text-[10px] font-medium text-[var(--ov-text-muted)]">
            {thread.status}
          </span>
        )}
      </div>

      {status === "loading" && (
        <p className="mt-3 text-sm leading-6 text-[var(--ov-text-muted)]">
          Loading negotiation thread&hellip;
        </p>
      )}

      {status === "not_found" && (
        <p className="mt-3 text-sm leading-6 text-[var(--ov-text-muted)]">
          Thread not available — negotiation may still be processing.
        </p>
      )}

      {status === "error" && (
        <div className="mt-3 space-y-2">
          <p className="text-sm leading-6 text-destructive">
            {error ?? "Failed to load negotiation thread."}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-medium text-[var(--ov-text-muted)] underline hover:text-[var(--ov-text)]"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {status === "success" && thread && thread.messages.length === 0 && (
        <p className="mt-3 text-sm leading-6 text-[var(--ov-text-muted)]">
          No messages in this negotiation.
        </p>
      )}

      {status === "success" && thread && thread.messages.length > 0 && (
        <div className="mt-3 space-y-2">
          {thread.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "rounded-xl px-3 py-2 text-sm leading-6",
                msg.senderType === "buyer"
                  ? "border border-[var(--ov-human-border)] bg-[var(--ov-human-bg)] text-[var(--ov-text)]"
                  : "border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text)]",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] font-semibold tracking-wider text-[var(--ov-text-muted)] uppercase">
                  {msg.senderType === "buyer" ? "Buyer" : "Provider"}
                  {msg.messageType !== "message" && (
                    <span className="ml-1 font-normal lowercase">
                      ({msg.messageType})
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-[var(--ov-text-muted)]">
                  {formatTimestamp(msg.createdAt)}
                </span>
              </div>
              <p className="mt-1">{msg.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
