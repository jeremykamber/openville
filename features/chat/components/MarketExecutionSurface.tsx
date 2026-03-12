"use client";

import { CandidateResults } from "@/features/search/components/CandidateResults";
import type {
  AgentPitchSceneState,
  EliminationCandidateViewModel,
  FinalistShowdownViewModel,
  NegotiationOutcomeViewModel,
  SearchResultsViewModel,
  WinnerSummaryViewModel,
} from "@/features/workflow/client/types";
import { NegotiationPanel } from "@/features/workflow/components/NegotiationPanel";
import { AgentPitchVisualization } from "@/features/workflow/components/ShortlistPanel";
import { VerdictSummary } from "@/features/workflow/components/WinnerPanel";

interface MarketExecutionSurfaceProps {
  search: {
    status: "idle" | "loading" | "success" | "empty" | "error";
    error: string | null;
  };
  searchViewModel: SearchResultsViewModel | null;
  onRetrySearch: () => void;

  eliminationViewModels: EliminationCandidateViewModel[];
  finalistViewModels: FinalistShowdownViewModel[];
  pitchSceneState: AgentPitchSceneState;

  onRunNegotiations: () => void;
  canRunNegotiations: boolean;

  negotiation: {
    status: "idle" | "loading" | "success" | "error";
    error: string | null;
  };
  negotiationViewModels: NegotiationOutcomeViewModel[];

  onSelectWinner: () => void;
  canSelectWinner: boolean;

  winner: {
    status: "idle" | "loading" | "success" | "error";
    error: string | null;
  };
  winnerViewModel: WinnerSummaryViewModel | null;
  winnerAgentId: string | null;
}

export function MarketExecutionSurface({
  search,
  searchViewModel,
  onRetrySearch,
  eliminationViewModels,
  finalistViewModels,
  pitchSceneState,
  onRunNegotiations,
  canRunNegotiations,
  negotiation,
  negotiationViewModels,
  onSelectWinner,
  canSelectWinner,
  winner,
  winnerViewModel,
  winnerAgentId,
}: MarketExecutionSurfaceProps) {
  return (
    <div className="space-y-6">
      <section className="ov-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="ov-kicker">Execution surface</p>
            <h2 className="mt-2 font-display text-2xl text-[var(--ov-text)]">
              Market, pitch, negotiate, verdict
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[var(--ov-text-muted)]">
            Candidates ranked, eliminated finalists visible, and the top-3
            showdown plays out with live thought bubbles.
          </p>
        </div>
      </section>

      {/* Candidate results — compact summary + elimination pills */}
      <div className="ov-panel rounded-[2rem] p-5 sm:p-6">
        <CandidateResults
          status={search.status}
          data={searchViewModel}
          error={search.error}
          onRetry={onRetrySearch}
          eliminationViewModels={eliminationViewModels}
        />
      </div>

      {/* Agent pitch visualization — 3 finalists + central buyer node + thought bubbles */}
      <AgentPitchVisualization
        finalists={finalistViewModels}
        sceneState={pitchSceneState}
        onRunNegotiations={onRunNegotiations}
        onSelectWinner={onSelectWinner}
        canRunNegotiations={canRunNegotiations}
        canSelectWinner={canSelectWinner}
        isNegotiating={negotiation.status === "loading"}
        isSelectingWinner={winner.status === "loading"}
        winnerAgentId={winnerAgentId}
      />

      {/* Negotiation status strip — compact badges per thread */}
      <NegotiationPanel
        status={negotiation.status}
        items={negotiationViewModels}
        error={negotiation.error}
      />

      {/* Verdict summary — winner highlight + reasoning strip */}
      <VerdictSummary
        status={winner.status}
        winner={winnerViewModel}
        error={winner.error}
      />
    </div>
  );
}
