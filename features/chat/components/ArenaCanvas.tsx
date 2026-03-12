"use client";

import { AgentMarketGraph, type MarketGraphStage } from "@/features/landing/components/market/AgentMarketGraph";
import type {
  AgentPitchSceneState,
  EliminationCandidateViewModel,
  FinalistShowdownViewModel,
  NegotiationOutcomeViewModel,
  SearchResultsViewModel,
} from "@/features/workflow/client/types";
import { AgentShowdown } from "@/features/workflow/components/AgentShowdown";
import { cn } from "@/lib/utils";

interface ArenaCanvasProps {
  stage: MarketGraphStage;
  stageCopy: { eyebrow: string; title: string };

  search: { status: "idle" | "loading" | "success" | "empty" | "error"; error: string | null };
  searchViewModel: SearchResultsViewModel | null;
  onRetrySearch: () => void;

  eliminationViewModels: EliminationCandidateViewModel[];

  finalistViewModels: FinalistShowdownViewModel[];
  pitchSceneState: AgentPitchSceneState;

  negotiation: { status: "idle" | "loading" | "success" | "error"; error: string | null };
  negotiationViewModels: NegotiationOutcomeViewModel[];

  winner: { status: "idle" | "loading" | "success" | "error"; error: string | null };
  winnerAgentId: string | null;

  canRunNegotiations: boolean;
  canSelectWinner: boolean;
  onRunNegotiations: () => void;
  onSelectWinner: () => void;
}

const GRAPH_STAGES: MarketGraphStage[] = ["market", "top10", "top3"];
const SHOWDOWN_STAGES: MarketGraphStage[] = ["top3-pitch", "negotiation", "winner"];

export function ArenaCanvas({
  stage,
  stageCopy,
  search,
  onRetrySearch,
  eliminationViewModels,
  finalistViewModels,
  pitchSceneState,
  negotiation,
  winner,
  winnerAgentId,
  canRunNegotiations,
  canSelectWinner,
  onRunNegotiations,
  onSelectWinner,
}: ArenaCanvasProps) {
  const showGraph = (GRAPH_STAGES as string[]).includes(stage);
  const showShowdown = (SHOWDOWN_STAGES as string[]).includes(stage);

  return (
    <div className="relative" style={{ height: "calc(100vh - 48px)" }}>
      {/* ── Graph phase: market → top10 → top3 ── */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          showGraph ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <AgentMarketGraph
          stage={stage}
          copy={stageCopy}
          layout="fullCanvas"
          eliminationData={eliminationViewModels}
        />

        {/* Loading overlay */}
        {search.status === "loading" && (
          <div className="absolute inset-0 flex items-end justify-center pb-20 pointer-events-none">
            <div className="flex items-center gap-3 rounded-2xl border border-[rgba(74,222,128,0.2)] bg-[rgba(7,11,9,0.85)] px-5 py-3 backdrop-blur-md">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--ov-signal-strong)] [animation:ov-pulse_1s_ease-in-out_infinite]" />
              <span className="text-sm text-[var(--ov-text)]">Ranking agents across the market…</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {search.status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl border border-[rgba(255,100,100,0.2)] bg-[rgba(7,11,9,0.9)] px-6 py-5 text-center backdrop-blur-md">
              <p className="text-sm text-[var(--ov-text)]">Market search failed</p>
              {search.error && (
                <p className="mt-1 text-xs text-[var(--ov-text-muted)]">{search.error}</p>
              )}
              <button
                type="button"
                onClick={onRetrySearch}
                className="mt-3 rounded-xl border border-[rgba(255,255,255,0.1)] px-4 py-2 text-xs text-[var(--ov-text-muted)] hover:text-white"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty overlay */}
        {search.status === "empty" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl border border-[var(--ov-border-medium)] bg-[rgba(7,11,9,0.9)] px-6 py-5 text-center backdrop-blur-md">
              <p className="text-sm text-[var(--ov-text)]">No agents found for this request</p>
              <button
                type="button"
                onClick={onRetrySearch}
                className="mt-3 rounded-xl border border-[rgba(255,255,255,0.1)] px-4 py-2 text-xs text-[var(--ov-text-muted)] hover:text-white"
              >
                Modify search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Showdown phase: top3-pitch → negotiation → winner ── */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          showShowdown ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <AgentShowdown
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
      </div>
    </div>
  );
}
