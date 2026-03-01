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
        body="Submit a request and the app will rank the best matching agents using the mock repository boundary."
      />
    );
  }

  if (status === "loading") {
    return (
      <ResultsState
        title="Ranking candidates"
        body="The mock search repository is simulating an async API call so the UI behaves like it will against the real backend."
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          Ranked matches ({data?.resultCount ?? 0})
        </h2>
        <p className="text-sm text-muted-foreground">
          Powered by the async mock repository boundary
        </p>
      </div>
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
