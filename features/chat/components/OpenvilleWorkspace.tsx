"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ArenaCanvas } from "@/features/chat/components/ArenaCanvas";
import { ArenaIntakeHero } from "@/features/chat/components/ArenaIntakeHero";
import { ArenaTopBar } from "@/features/chat/components/ArenaTopBar";
import { EvidenceDrawer } from "@/features/chat/components/EvidenceDrawer";
import type { MarketGraphStage } from "@/features/landing/components/market/AgentMarketGraph";
import { toInspectorArtifacts } from "@/features/workflow/client/adapters";
import { useOpenvilleFlow } from "@/features/workflow/hooks/useOpenvilleFlow";

function getGraphStage({
  searchStatus,
  shortlistCount,
  negotiationStatus,
  winnerStatus,
}: {
  searchStatus: "idle" | "loading" | "success" | "empty" | "error";
  shortlistCount: number;
  negotiationStatus: "idle" | "loading" | "success" | "error";
  winnerStatus: "idle" | "loading" | "success" | "error";
}): MarketGraphStage {
  if (winnerStatus === "success") return "winner";
  if (negotiationStatus !== "idle") return "negotiation";
  if (shortlistCount > 0) return "top3";
  if (searchStatus !== "idle") return "top10";
  return "market";
}

function getStageCopy(stage: MarketGraphStage) {
  if (stage === "winner") {
    return {
      eyebrow: "Selection complete",
      title: "Winner rationale stays attached to the market that produced it.",
    };
  }
  if (stage === "negotiation") {
    return {
      eyebrow: "Negotiation live",
      title: "Three finalists are actively refining price, scope, and execution risk.",
    };
  }
  if (stage === "top3" || stage === "top3-pitch") {
    return {
      eyebrow: "Shortlist ready",
      title: "The field is down to three operators worth negotiating with.",
    };
  }
  if (stage === "top10") {
    return {
      eyebrow: "Market ranked",
      title: "The market has narrowed a broad search into ranked survivors with visible signal quality.",
    };
  }
  return {
    eyebrow: "Market thesis",
    title: "One request fans out across a visible operator graph before converging on a winning trade partner.",
  };
}

export function OpenvilleWorkspace() {
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const {
    messages,
    input,
    setInput,
    prepareRequest,
    homepageControls,
    updateHomepageSpeed,
    updateHomepageBudget,
    contextForm,
    contextSummary,
    updateContextField,
    workflowStatus,
    refreshStatus,
    search,
    negotiation,
    winner,
    searchViewModel,
    shortlistViewModels,
    negotiationViewModels,
    latestExecutionMeta,
    eliminationViewModels,
    finalistShowdownViewModels,
    agentPitchSceneState,
    isBusy,
    canRunNegotiations,
    canSelectWinner,
    runNegotiations,
    selectWinner,
    threadStatus,
    thread,
    threadError,
    activeNegotiationId,
    availableNegotiationIds,
    fetchNegotiationThread,
    retryNegotiationThread,
    resetWorkflow,
    requestQuery,
    submitContext,
  } = useOpenvilleFlow();

  // Show intake hero until the user has submitted a request
  const isIntake = requestQuery === null;

  // Auto-trigger the search when a new request is prepared (deferred one tick
  // so React has flushed the contextForm state update from prepareRequest)
  const autoSubmitRef = useRef<string | null>(null);
  useEffect(() => {
    if (requestQuery !== null && autoSubmitRef.current !== requestQuery) {
      autoSubmitRef.current = requestQuery;
      const timer = setTimeout(() => { void submitContext(); }, 0);
      return () => clearTimeout(timer);
    }
  }, [requestQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const stage = getGraphStage({
    searchStatus: search.status,
    shortlistCount: shortlistViewModels.length,
    negotiationStatus: negotiation.status,
    winnerStatus: winner.status,
  });
  const stageCopy = getStageCopy(stage);

  const inspectorArtifacts = useMemo(() => {
    return toInspectorArtifacts({
      searchResults: search.data?.searchResults ?? undefined,
      selectionSummary: search.data?.selectionResult?.summary,
      outcomes: negotiation.data?.outcomes,
      winnerResponse: winner.data,
      warnings: latestExecutionMeta?.warnings,
      eliminationViewModels,
    });
  }, [search.data, negotiation.data, winner.data, latestExecutionMeta?.warnings, eliminationViewModels]);

  return (
    <div className="ov-shell">
      {isIntake ? (
        <ArenaIntakeHero
          value={input}
          onChange={setInput}
          onSubmit={prepareRequest}
          disabled={isBusy}
          controls={homepageControls}
          onSpeedChange={updateHomepageSpeed}
          onBudgetChange={updateHomepageBudget}
        />
      ) : (
        <>
          <ArenaTopBar
            jobSummary={input}
            budget={homepageControls.budget}
            stage={stage}
            resultCount={searchViewModel?.resultCount ?? 0}
            onOpenEvidence={() => setEvidenceOpen(true)}
            onReset={resetWorkflow}
          />

          <ArenaCanvas
            stage={stage}
            stageCopy={stageCopy}
            search={search}
            searchViewModel={searchViewModel}
            onRetrySearch={submitContext}
            eliminationViewModels={eliminationViewModels}
            finalistViewModels={finalistShowdownViewModels}
            pitchSceneState={agentPitchSceneState}
            negotiation={negotiation}
            negotiationViewModels={negotiationViewModels}
            winner={winner}
            winnerAgentId={winner.data?.winner.candidateId ?? null}
            canRunNegotiations={canRunNegotiations}
            canSelectWinner={canSelectWinner}
            onRunNegotiations={runNegotiations}
            onSelectWinner={selectWinner}
          />

          <EvidenceDrawer
            open={evidenceOpen}
            onClose={() => setEvidenceOpen(false)}
            workflowStatus={workflowStatus}
            latestExecutionMeta={latestExecutionMeta}
            onRefresh={refreshStatus}
            artifacts={inspectorArtifacts}
            messages={messages}
            threadStatus={threadStatus}
            thread={thread}
            threadError={threadError}
            onRetryThread={retryNegotiationThread}
            activeNegotiationId={activeNegotiationId}
            availableNegotiationIds={availableNegotiationIds}
            onSelectThread={fetchNegotiationThread}
            values={contextForm}
            summary={contextSummary}
            onFieldChange={updateContextField}
            onSubmit={submitContext}
            disabled={!canRunNegotiations}
            hasSubmittedSearch={search.status !== "idle"}
          />
        </>
      )}
    </div>
  );
}
