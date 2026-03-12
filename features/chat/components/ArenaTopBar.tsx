"use client";

import type { MarketGraphStage } from "@/features/landing/components/market/AgentMarketGraph";
import { cn } from "@/lib/utils";

interface ArenaTopBarProps {
  jobSummary: string;
  budget: string;
  stage: MarketGraphStage;
  resultCount: number;
  onOpenEvidence: () => void;
  onReset: () => void;
}

const STAGE_LABEL: Record<MarketGraphStage, string> = {
  market: "Searching",
  top10: "Top 10",
  top3: "Top 3",
  "top3-pitch": "Pitch live",
  negotiation: "Negotiating",
  winner: "Winner selected",
};

const STAGE_DOT_CLASS: Record<MarketGraphStage, string> = {
  market: "bg-[var(--ov-signal-strong)] [animation:ov-pulse_2s_ease-in-out_infinite]",
  top10: "bg-[var(--ov-signal-strong)]",
  top3: "bg-[var(--ov-negotiation)]",
  "top3-pitch": "bg-[var(--ov-negotiation)] [animation:ov-pulse_2s_ease-in-out_infinite]",
  negotiation: "bg-[var(--ov-negotiation)] [animation:ov-pulse_2s_ease-in-out_infinite]",
  winner: "bg-[var(--ov-winner)]",
};

export function ArenaTopBar({
  jobSummary,
  budget,
  stage,
  resultCount,
  onOpenEvidence,
  onReset,
}: ArenaTopBarProps) {
  const truncatedJob =
    jobSummary.length > 60 ? jobSummary.slice(0, 57) + "…" : jobSummary;

  return (
    <div className="sticky top-0 z-50 flex h-12 items-center gap-4 border-b border-[var(--ov-border-soft)] bg-[rgba(7,11,9,0.92)] px-5 backdrop-blur-md">
      {/* Stage indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            STAGE_DOT_CLASS[stage],
          )}
        />
        <span className="text-xs font-semibold text-[var(--ov-text)]">
          {STAGE_LABEL[stage]}
        </span>
      </div>

      <span className="text-[var(--ov-border-medium)]">·</span>

      {/* Job summary */}
      <span className="min-w-0 truncate text-xs text-[var(--ov-text-muted)]">
        {truncatedJob}
      </span>

      {/* Spacer */}
      <div className="ml-auto flex items-center gap-4 shrink-0">
        {budget ? (
          <span className="text-xs text-[var(--ov-text-muted)]">
            ${Number(budget).toLocaleString()} cap
          </span>
        ) : null}
        {resultCount > 0 ? (
          <span className="text-xs text-[var(--ov-text-muted)]">
            {resultCount} ranked
          </span>
        ) : null}

        <button
          type="button"
          onClick={onOpenEvidence}
          className="rounded-xl border border-[var(--ov-border-soft)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-xs text-[var(--ov-text-muted)] transition hover:border-[var(--ov-border-medium)] hover:text-[var(--ov-text)]"
        >
          Inspector
        </button>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-[var(--ov-text-muted)] transition hover:text-[var(--ov-text)]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
