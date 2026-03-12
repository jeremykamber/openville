"use client";

import { Badge } from "@/components/ui/badge";
import type { WinnerSummaryViewModel } from "@/features/workflow/client/types";

interface VerdictSummaryProps {
  status: "idle" | "loading" | "success" | "error";
  winner: WinnerSummaryViewModel | null;
  error: string | null;
}

/**
 * Compact verdict summary strip.
 *
 * Replaces the previous full-width WinnerPanel card grid.
 * The winner highlight now appears on the AgentPitchVisualization
 * scene node; this component renders the verdict reasoning and
 * summary as a slim strip below the scene.
 */
export function VerdictSummary({
  status,
  winner,
  error,
}: VerdictSummaryProps) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="rounded-[2rem] border border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] px-5 py-5">
        <p className="ov-kicker">Verdict</p>
        <p className="mt-2 text-sm leading-7 text-[var(--ov-text-muted)]">
          The reasoning layer is comparing the final offers and selecting the
          strongest fit for the buyer.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-[2rem] border border-destructive/30 bg-[var(--ov-surface-card)] px-5 py-5">
        <p className="ov-kicker">Verdict</p>
        <p className="mt-2 text-sm leading-7 text-destructive">{error}</p>
      </div>
    );
  }

  if (!winner) return null;

  return (
    <div className="rounded-[2rem] border border-[var(--ov-winner-border)] bg-[var(--ov-gradient-winner)] px-5 py-5 shadow-[0_24px_60px_var(--ov-shadow-strong)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="ov-kicker">Verdict</p>
          <p className="mt-2 font-display text-2xl text-[var(--ov-text)]">
            {winner.candidateName}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="border-0 bg-[var(--ov-winner-soft)] text-[var(--ov-winner)]">
            {winner.confidenceLabel}
          </Badge>
          <Badge className="ov-chip-human border-0">
            {winner.priceLabel}
          </Badge>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--ov-text-muted)]">
        {winner.reasoning}
      </p>
      <p className="mt-3 text-sm font-medium text-[var(--ov-text)]">
        {winner.summary}
      </p>
    </div>
  );
}
