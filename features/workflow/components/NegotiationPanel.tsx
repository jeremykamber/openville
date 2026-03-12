"use client";

import { Badge } from "@/components/ui/badge";
import type { NegotiationOutcomeViewModel } from "@/features/workflow/client/types";
import { cn } from "@/lib/utils";

interface NegotiationPanelProps {
  status: "idle" | "loading" | "success" | "error";
  items: NegotiationOutcomeViewModel[];
  error: string | null;
}

function statusBadgeClass(itemStatus: NegotiationOutcomeViewModel["status"]) {
  if (itemStatus === "completed") return "ov-chip-success border-0";
  if (itemStatus === "rejected")
    return "border-0 bg-[var(--ov-negotiation-soft)] text-[var(--ov-negotiation)]";
  return "border-0 bg-destructive/15 text-destructive";
}

/**
 * Compact negotiation status strip.
 *
 * Detailed negotiation content now renders inside thought bubbles
 * on the AgentPitchVisualization scene. This component shows a
 * slim status bar with per-thread outcome badges.
 */
export function NegotiationPanel({
  status,
  items,
  error,
}: NegotiationPanelProps) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="rounded-[1.5rem] border border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] px-5 py-4">
        <div className="flex items-center gap-3">
          <p className="ov-kicker">Negotiations</p>
          <Badge className="border-0 bg-[var(--ov-negotiation-soft)] text-[var(--ov-negotiation)]">
            In progress
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-7 text-[var(--ov-text-muted)]">
          Buyer and seller agents are refining offers across the finalists.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-[1.5rem] border border-destructive/30 bg-[var(--ov-surface-card)] px-5 py-4">
        <p className="ov-kicker">Negotiations</p>
        <p className="mt-2 text-sm leading-7 text-destructive">{error}</p>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-[1.5rem] border border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="ov-kicker">Negotiations</p>
        <Badge className="border-0 bg-[var(--ov-negotiation-soft)] text-[var(--ov-negotiation)]">
          {items.length} threads
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={`${item.candidateId}-${item.status}`}
            className="flex items-center gap-2 rounded-full border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-3 py-1.5"
          >
            <span className="text-xs font-medium text-[var(--ov-text)]">
              {item.candidateName}
            </span>
            <Badge className={cn("text-[10px]", statusBadgeClass(item.status))}>
              {item.statusLabel}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
