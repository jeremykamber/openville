"use client";

import { CandidateCard } from "@/features/search/components/CandidateCard";
import { ResultsState } from "@/features/search/components/ResultsState";
import type { SearchResultsViewModel } from "@/features/workflow/client/types";

interface CandidateResultsProps {
  status: "idle" | "loading" | "success" | "empty" | "error";
  data: SearchResultsViewModel | null;
  error: string | null;
  onRetry: () => void;
}

export function CandidateResults({
  status,
  data,
  error,
  onRetry,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="ov-kicker">Ranked survivors</p>
          <h2 className="mt-2 font-display text-2xl text-[var(--ov-text)]">
            Candidate board ({data?.resultCount ?? 0})
          </h2>
        </div>
        <p className="rounded-full border border-[var(--ov-signal-border)] bg-[var(--ov-signal-soft)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-signal-strong)] uppercase">
          Ranked by relevance, reliability, and your priorities
        </p>
      </div>
      {data?.summary ? (
        <div className="rounded-2xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] px-4 py-3 text-sm leading-7 text-[var(--ov-text-muted)]">
          {data.summary}
        </div>
      ) : null}
      {data?.warnings.length ? (
        <div className="rounded-2xl border border-[var(--ov-negotiation)] bg-[var(--ov-negotiation-soft)] px-4 py-3 text-sm leading-7 text-[var(--ov-text-muted)]">
          {data.warnings.join(" ")}
        </div>
      ) : null}
      <div className="grid gap-4">
        {data?.candidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.agentId}
            candidate={candidate}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
