"use client";

import { CandidateCard } from "@/features/search/components/CandidateCard";
import { ResultsState } from "@/features/search/components/ResultsState";
import type { RankedSearchResponse } from "@/features/shared/contracts/SearchContracts";

interface CandidateResultsProps {
  status: "idle" | "loading" | "success" | "empty" | "error";
  data: RankedSearchResponse | null;
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
        body="Searching for available agents and ranking them by your priorities."
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
          data?.followUpQuestion ??
          "Try adding urgency, budget, or the exact service type to improve the ranking."
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
        <p className="rounded-full border border-[rgba(103,215,255,0.18)] bg-[rgba(103,215,255,0.1)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-signal-strong)] uppercase">
          Ranked by relevance, reliability, and your priorities
        </p>
      </div>
      {data?.followUpQuestion ? (
        <div className="rounded-2xl border border-[rgba(124,170,255,0.14)] bg-[rgba(13,23,38,0.72)] px-4 py-3 text-sm leading-7 text-[var(--ov-text-muted)]">
          {data.followUpQuestion}
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
