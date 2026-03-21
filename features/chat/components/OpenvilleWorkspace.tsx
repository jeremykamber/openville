"use client";

import { useCallback, useEffect, useState } from "react";

import { MessageList } from "@/features/chat/components/MessageList";
import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { ClosureSection } from "@/features/landing/components/ClosureSection";
import { FinalistSection } from "@/features/landing/components/FinalistSection";
import { FunnelSection } from "@/features/landing/components/FunnelSection";
import { HandoffSection } from "@/features/landing/components/HandoffSection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { OldWaySection } from "@/features/landing/components/OldWaySection";
import { CandidateResults } from "@/features/search/components/CandidateResults";
import { ContextFormPanel } from "@/features/workflow/components/ContextFormPanel";
import { NegotiationPanel } from "@/features/workflow/components/NegotiationPanel";
import { ShortlistPanel } from "@/features/workflow/components/ShortlistPanel";
import { WinnerPanel } from "@/features/workflow/components/WinnerPanel";
import { WorkflowStatusPanel } from "@/features/workflow/components/WorkflowStatusPanel";
import { useOpenvilleFlow } from "@/features/workflow/hooks/useOpenvilleFlow";
import { cn } from "@/lib/utils";

const TRANSITION_DURATION_MS = 500;

type WorkspaceMode = "story" | "transitioning" | "active";

export function OpenvilleWorkspace() {
  const [mode, setMode] = useState<WorkspaceMode>("story");
  const [activeVisible, setActiveVisible] = useState(false);

  const {
    messages,
    input,
    setInput,
    prepareRequest,
    contextForm,
    contextSummary,
    updateContextField,
    submitContext,
    workflowStatus,
    refreshStatus,
    search,
    negotiation,
    winner,
    searchViewModel,
    shortlistViewModels,
    negotiationViewModels,
    winnerViewModel,
    latestExecutionMeta,
    isBusy,
    canRunMarket,
    canRunNegotiations,
    canSelectWinner,
    runNegotiations,
    selectWinner,
  } = useOpenvilleFlow();

  // After transitioning state is set, wait for the fade-out to finish
  // then swap to active mode and fade it in.
  useEffect(() => {
    if (mode !== "transitioning") return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const delay = prefersReduced ? 0 : TRANSITION_DURATION_MS;

    const timer = setTimeout(() => {
      setMode("active");
      requestAnimationFrame(() => setActiveVisible(true));
    }, delay);

    return () => clearTimeout(timer);
  }, [mode]);

  const handleSubmit = useCallback(() => {
    const prepared = prepareRequest();

    if (!prepared) {
      return;
    }

    if (mode === "active") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setActiveVisible(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    setMode("transitioning");
  }, [mode, prepareRequest]);

  if (mode === "active") {
    return (
      <div className="ov-shell min-h-screen">
        <main
          className={cn(
            "mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 transition-all duration-500 ease-out sm:px-6 lg:px-8",
            activeVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0",
          )}
        >
          <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
            <div className="space-y-6">
              <div className="ov-panel-strong rounded-[2rem] p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="ov-chip rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                    Live command center
                  </span>
                  <span className="ov-chip-human rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                    Northstar Launch
                  </span>
                </div>
                <h2 className="mt-5 font-display text-3xl leading-tight text-[var(--ov-text)] sm:text-4xl">
                  The story is over. The live market is open.
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--ov-text-muted)]">
                  Draft the buyer request, confirm the structured brief, then
                  let the backend workflow search, shortlist, negotiate, and
                  pick the winner with visible fallback signals.
                </p>
                <div className="mt-5">
                  <RequestComposer
                    value={input}
                    onChange={setInput}
                    onSubmit={handleSubmit}
                    disabled={isBusy}
                    variant="active"
                    submitLabel="Draft new request"
                    loadingLabel="Workflow busy..."
                  />
                </div>
              </div>

              <WorkflowStatusPanel
                status={workflowStatus}
                latestExecutionMeta={latestExecutionMeta}
                onRefresh={refreshStatus}
              />

              <ContextFormPanel
                values={contextForm}
                summary={contextSummary}
                onFieldChange={updateContextField}
                onSubmit={submitContext}
                disabled={!canRunMarket}
                hasSubmittedSearch={search.status !== "idle"}
              />

              <div className="ov-panel rounded-[2rem] p-5 sm:p-6">
                <MessageList messages={messages} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="ov-panel rounded-[2rem] p-5 sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="ov-kicker">Ranked Market Output</p>
                    <h2 className="mt-2 font-display text-2xl text-[var(--ov-text)]">
                      Candidate board
                    </h2>
                  </div>
                  <span className="ov-chip-success rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                    Relevance + reliability + budget
                  </span>
                </div>
                <CandidateResults
                  status={search.status}
                  data={searchViewModel}
                  error={search.error}
                  onRetry={submitContext}
                />
              </div>

              <ShortlistPanel
                searchStatus={search.status}
                items={shortlistViewModels}
                summary={searchViewModel?.summary ?? null}
                error={search.error}
                onRunNegotiations={runNegotiations}
                disabled={!canRunNegotiations}
                isRunning={negotiation.status === "loading"}
              />

              <NegotiationPanel
                status={negotiation.status}
                items={negotiationViewModels}
                error={negotiation.error}
                onSelectWinner={selectWinner}
                disabled={!canSelectWinner}
                isSelectingWinner={winner.status === "loading"}
              />

              <WinnerPanel
                status={winner.status}
                winner={winnerViewModel}
                error={winner.error}
              />
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Story mode (and transitioning): scroll-triggered landing narrative
  const isTransitioning = mode === "transitioning";

  return (
    <div className="ov-shell min-h-screen">
      <div
        className={cn(
          "transition-all ease-out",
          isTransitioning
            ? "scale-[0.98] opacity-0 duration-500"
            : "scale-100 opacity-100 duration-300",
        )}
      >
        {/* Section 1: The Hook */}
        <HeroSection
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={isBusy || isTransitioning}
        />

        {/* Section 2: The Old Way */}
        <OldWaySection />

        {/* Section 3: The Handoff */}
        <HandoffSection />

        {/* Section 4: The Agent Economy (Funnel) */}
        <FunnelSection />

        {/* Section 5: The Finalist Breakdown */}
        <FinalistSection />

        {/* Section 6: Lifecycle & Climax CTA */}
        <ClosureSection
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={isBusy || isTransitioning}
        />
      </div>
    </div>
  );
}
