"use client";

import { ResultsState } from "@/features/search/components/ResultsState";
import type {
  EliminationCandidateViewModel,
  SearchResultsViewModel,
} from "@/features/workflow/client/types";

interface CandidateResultsProps {
  status: "idle" | "loading" | "success" | "empty" | "error";
  data: SearchResultsViewModel | null;
  error: string | null;
  onRetry: () => void;
  /** Elimination view-models for ranks 4–10 — shown as compact pills with tooltip reasons. */
  eliminationViewModels?: EliminationCandidateViewModel[];
}

/**
 * Compact candidate results with elimination strip.
 *
 * The full card grid has been replaced by a summary header plus
 * compact elimination pills that surface inferred reasons on hover.
 * The market graph (in MarketCommandDeck) now drives the primary
 * spatial visualization of the top-10 stage.
 */
export function CandidateResults({
  status,
  data,
  error,
  onRetry,
  eliminationViewModels = [],
}: CandidateResultsProps) {
  if (status === "idle") {
    return (
      <ResultsState
        title="No results yet"
        body="Submit a request to find and rank the best matching agents for your job."
      />
    );
  }

  if (status === "loading") {
    return (
      <ResultsState
        title="Ranking candidates"
        body="Searching the backend market, ranking candidates, and preparing the shortlist."
      />
    );
  }

  if (status === "error") {
    return (
      <ResultsState
        title="Search failed"
        body={error ?? "Something went wrong while ranking the candidates."}
        actionLabel="Retry search"
        onAction={onRetry}
      />
    );
  }

  if (status === "empty") {
    return (
      <ResultsState
        title="No matches found"
        body={
          data?.warnings[0] ??
          "Try adjusting the service category, budget, or location to widen the market."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="ov-kicker">Market ranked</p>
          <h2 className="mt-2 font-display text-2xl text-[var(--ov-text)]">
            {data?.resultCount ?? 0} candidates evaluated
          </h2>
        </div>
        <p className="rounded-full border border-[var(--ov-signal-border)] bg-[var(--ov-signal-soft)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-signal-strong)] uppercase">
          Ranked by relevance, reliability, and your priorities
        </p>
      </div>

      {/* Summary */}
      {data?.summary ? (
        <div className="rounded-2xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] px-4 py-3 text-sm leading-7 text-[var(--ov-text-muted)]">
          {data.summary}
        </div>
      ) : null}

      {/* Warnings */}
      {data?.warnings.length ? (
        <div className="rounded-2xl border border-[var(--ov-negotiation)] bg-[var(--ov-negotiation-soft)] px-4 py-3 text-sm leading-7 text-[var(--ov-text-muted)]">
          {data.warnings.join(" ")}
        </div>
      ) : null}

      {/* Top 3 compact strip */}
      {data && data.candidates.length > 0 ? (
        <div className="space-y-2">
          <p className="ov-kicker">Top 3 finalists</p>
          <div className="flex flex-wrap gap-2">
            {data.candidates.slice(0, 3).map((candidate, index) => (
              <div
                key={candidate.agentId}
                className="rounded-full border border-[var(--ov-signal-border)] bg-[var(--ov-signal-soft)] px-3 py-1.5"
              >
                <span className="text-xs font-semibold text-[var(--ov-text)]">
                  #{index + 1} {candidate.name}
                </span>
                <span className="ml-2 text-[10px] text-[var(--ov-text-muted)]">
                  {candidate.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Elimination strip — compact pills with tooltip reasons */}
      {eliminationViewModels.length > 0 ? (
        <div className="space-y-2">
          <p className="ov-kicker">Eliminated (ranked 4–10)</p>
          <div className="flex flex-wrap gap-2">
            {eliminationViewModels.map((vm) => (
              <div key={vm.agentId} className="group relative">
                <div className="rounded-full border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-3 py-1.5">
                  <span className="text-xs text-[var(--ov-text-muted)]">
                    #{vm.rank} {vm.name}
                  </span>
                </div>
                {/* Tooltip with elimination reason */}
                <div className="invisible absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-0)] px-3 py-2 text-center shadow-[0_12px_40px_var(--ov-shadow)] group-hover:visible">
                  <p className="text-[10px] leading-4 text-[var(--ov-text-muted)]">
                    <span className="font-semibold text-[var(--ov-negotiation)]">
                      Inferred
                    </span>{" "}
                    {vm.eliminationReason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
