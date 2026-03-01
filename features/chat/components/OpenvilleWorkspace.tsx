"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AlertCircle } from "lucide-react";

import { FollowUpPrompt } from "@/features/chat/components/FollowUpPrompt";
import { MessageList } from "@/features/chat/components/MessageList";
import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { useChatFlow } from "@/features/chat/hooks/useChatFlow";
import { ClosureSection } from "@/features/landing/components/ClosureSection";
import { FinalistSection } from "@/features/landing/components/FinalistSection";
import { FunnelSection } from "@/features/landing/components/FunnelSection";
import { HandoffSection } from "@/features/landing/components/HandoffSection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { OldWaySection } from "@/features/landing/components/OldWaySection";
import { CandidateResults } from "@/features/search/components/CandidateResults";
import { cn } from "@/lib/utils";

const TRANSITION_DURATION_MS = 500;

type WorkspaceMode = "story" | "transitioning" | "active";

export function OpenvilleWorkspace() {
  const [mode, setMode] = useState<WorkspaceMode>("story");
  const [activeVisible, setActiveVisible] = useState(false);
  const submitRef = useRef<(() => Promise<void>) | null>(null);

  const {
    messages,
    input,
    setInput,
    submitRequest,
    preferences,
    followUpQuestion,
    chatError,
    isSubmitting,
    results,
  } = useChatFlow();

  // After transitioning state is set, wait for the fade-out to finish
  // then swap to active mode and fade it in
  useEffect(() => {
    if (mode !== "transitioning") return;

    // Respect prefers-reduced-motion — skip the delay
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const delay = prefersReduced ? 0 : TRANSITION_DURATION_MS;

    const timer = setTimeout(() => {
      setMode("active");
      // Fire the actual request now that we're in active mode
      submitRef.current?.();
      submitRef.current = null;
      // Small frame delay so active UI mounts at opacity-0 before fading in
      requestAnimationFrame(() => setActiveVisible(true));
    }, delay);

    return () => clearTimeout(timer);
  }, [mode]);

  /**
   * Submit handler: triggers fade-out transition, then swaps to active mode.
   * The actual API call is deferred until active mode renders so the user
   * sees the loading state in the active UI, not during the fade-out.
   */
  const handleSubmit = useCallback(() => {
    submitRef.current = submitRequest;
    window.scrollTo({ top: 0, behavior: "instant" });
    setMode("transitioning");
  }, [submitRequest]);

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
                  Submit the request and the workspace will rank contenders,
                  keep the negotiation context visible, and preserve the same
                  launch-rescue scenario from the landing narrative.
                </p>
                <div className="mt-5">
                  <RequestComposer
                    value={input}
                    onChange={setInput}
                    onSubmit={handleSubmit}
                    disabled={isSubmitting}
                    variant="active"
                  />
                </div>
              </div>

              <div className="ov-panel rounded-[2rem] p-5 sm:p-6">
                {chatError ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <p>{chatError}</p>
                  </div>
                ) : null}
                <MessageList messages={messages} />
              </div>

              <FollowUpPrompt
                followUpQuestion={followUpQuestion}
                preferences={preferences}
              />
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
                  status={results.status}
                  data={results.data}
                  error={results.error}
                  onRetry={results.retry}
                />
              </div>
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
          disabled={isSubmitting || isTransitioning}
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
          disabled={isSubmitting || isTransitioning}
        />
      </div>
    </div>
  );
}
