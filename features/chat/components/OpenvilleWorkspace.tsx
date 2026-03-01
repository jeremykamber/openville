"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import { AlertCircle } from "lucide-react";

import { FollowUpPrompt } from "@/features/chat/components/FollowUpPrompt";
import { MessageList } from "@/features/chat/components/MessageList";
import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { useChatFlow } from "@/features/chat/hooks/useChatFlow";
import { ClosureSection } from "@/features/landing/components/ClosureSection";
import { CommunicationSection } from "@/features/landing/components/CommunicationSection";
import { FinalistSection } from "@/features/landing/components/FinalistSection";
import { Footer } from "@/features/landing/components/Footer";
import { FunnelSection } from "@/features/landing/components/FunnelSection";
import { HandoffSection } from "@/features/landing/components/HandoffSection";
import { Header } from "@/features/landing/components/Header";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { OldWaySection } from "@/features/landing/components/OldWaySection";
import { CandidateResults } from "@/features/search/components/CandidateResults";
import { EASE, fadeUp, stagger, cardUp } from "@/lib/motion";

// ── Motion config (non-shared one-offs) ──────────────────────────────────────

const storyExit = {
  opacity: 0,
  scale: 0.97,
  transition: { duration: 0.5, ease: EASE },
};

// ── Component ────────────────────────────────────────────────────────────────

const TRANSITION_DURATION_MS = 500;

type WorkspaceMode = "story" | "transitioning" | "active";

export function OpenvilleWorkspace() {
  const [mode, setMode] = useState<WorkspaceMode>("story");
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

  // After transitioning state is set, wait for the exit animation to finish
  // then swap to active mode
  useEffect(() => {
    if (mode !== "transitioning") return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const delay = prefersReduced ? 0 : TRANSITION_DURATION_MS;

    const timer = setTimeout(() => {
      setMode("active");
      submitRef.current?.();
      submitRef.current = null;
    }, delay);

    return () => clearTimeout(timer);
  }, [mode]);

  const handleSubmit = useCallback(() => {
    submitRef.current = submitRequest;
    window.scrollTo({ top: 0, behavior: "instant" });
    setMode("transitioning");
  }, [submitRequest]);

  const isStoryMode = mode !== "active";

  const handleActiveNavClick = useCallback(
    (href: string) => {
      // Switch back to story mode and scroll to section
      setMode("story");
      window.scrollTo({ top: 0, behavior: "instant" });
      // After mode switch, scroll to the section
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 600); // Wait for transition animation
    },
    [],
  );

  return (
    <div className="ov-shell min-h-screen">
      {/* Header — visible in both story and active modes */}
      <motion.div
        key="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <Header onNavClick={handleActiveNavClick} />
      </motion.div>

      <AnimatePresence mode="wait">
        {mode !== "active" ? (
          <motion.div
            key="story"
            exit={storyExit}
          >
            {/* Section 1: The Hook */}
            <HeroSection
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={isSubmitting || mode === "transitioning"}
            />

            {/* Section 2: The Old Way */}
            <OldWaySection />

            {/* Section 3: The Handoff */}
            <HandoffSection />

            {/* Section 4: Communication & Bargaining */}
            <CommunicationSection />

            {/* Section 5: The Agent Economy (Funnel) */}
            <FunnelSection />

            {/* Section 5: The Finalist Breakdown */}
            <FinalistSection />

            {/* Section 6: Lifecycle & Climax CTA */}
            <ClosureSection
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={isSubmitting || mode === "transitioning"}
            />

            {/* Footer */}
            <Footer />
          </motion.div>
        ) : (
          <motion.main
            key="active"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8"
            aria-live="polite"
          >
            <motion.section
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-start"
            >
              <div className="space-y-6">
                <motion.div
                  variants={cardUp}
                  className="ov-panel-strong rounded-[2rem] p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="ov-chip rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Live command center
                    </span>
                    <span className="ov-chip-human rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Your request
                    </span>
                  </div>
                  <h2 className="mt-5 font-display text-3xl leading-tight text-[var(--ov-text)] sm:text-4xl">
                    The story is over. The live market is open.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--ov-text-muted)]">
                    Submit your request and the workspace will search the
                    market, rank tradespeople by your priorities, and handle
                    agent-to-agent negotiation in real time.
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
                </motion.div>

                <motion.div
                  variants={cardUp}
                  className="ov-panel rounded-[2rem] p-5 sm:p-6"
                >
                  {chatError ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <p>{chatError}</p>
                    </div>
                  ) : null}
                  <MessageList messages={messages} />
                </motion.div>

                <motion.div variants={cardUp}>
                  <FollowUpPrompt
                    followUpQuestion={followUpQuestion}
                    preferences={preferences}
                  />
                </motion.div>
              </div>

              <motion.div variants={cardUp} className="space-y-6">
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
              </motion.div>
            </motion.section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
