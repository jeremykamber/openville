"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "@/features/landing/components/market/ThoughtBubble";
import type {
  AgentPitchSceneState,
  FinalistShowdownViewModel,
} from "@/features/workflow/client/types";
import { cn } from "@/lib/utils";

interface AgentShowdownProps {
  finalists: FinalistShowdownViewModel[];
  sceneState: AgentPitchSceneState;
  onRunNegotiations: () => void;
  onSelectWinner: () => void;
  canRunNegotiations: boolean;
  canSelectWinner: boolean;
  isNegotiating: boolean;
  isSelectingWinner: boolean;
  winnerAgentId?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Layout — finalist nodes in middle, arrows DOWN to job agent bottom */
/* ------------------------------------------------------------------ */

// Positions are % of canvas (left=x, top=y)
// Finalists are in the middle band; job agent is at the bottom center.
// Thought bubbles render bottom-full (upward) from each finalist node.
const finalistPositions = [
  { x: 18, y: 57 },
  { x: 50, y: 50 },
  { x: 82, y: 57 },
];
const jobAgentPosition = { x: 50, y: 83 };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getBubbleText(
  finalist: FinalistShowdownViewModel,
  sceneState: AgentPitchSceneState,
): string {
  if (sceneState === "pitching") return finalist.pitchText;
  if (sceneState === "evaluating" || sceneState === "verdict")
    return finalist.evaluationNotes || finalist.pitchText;
  return "";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AgentShowdown({
  finalists,
  sceneState,
  onRunNegotiations,
  onSelectWinner,
  canRunNegotiations,
  canSelectWinner,
  isNegotiating,
  isSelectingWinner,
  winnerAgentId,
}: AgentShowdownProps) {
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(
    new Set(),
  );
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Staggered thought bubble reveal
  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRevealedIndices(new Set());

    if (sceneState === "idle" || finalists.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      setRevealedIndices(new Set(finalists.map((_, i) => i)));
      return;
    }

    finalists.forEach((_, index) => {
      const timer = setTimeout(() => {
        setRevealedIndices((prev) => new Set([...prev, index]));
      }, 300 + index * 700);
      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [sceneState, finalists]);

  return (
    <div className="relative w-full" style={{ minHeight: "660px" }}>
      {/* Dark arena background */}
      <div className="absolute inset-0 rounded-[2rem] bg-[#070b09]" />
      <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(90,150,110,0.12),transparent)]" />
      <div className="absolute inset-0 rounded-[2rem] ov-grid opacity-[0.06]" />

      {/* Stage badge — top left */}
      <div className="absolute left-5 top-5 z-20">
        <span
          className={cn(
            "rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-500",
            sceneState === "verdict"
              ? "border-[var(--ov-winner-border)] bg-[var(--ov-winner-soft)] text-[var(--ov-winner)]"
              : sceneState === "evaluating"
                ? "border-[var(--ov-signal-border)] bg-[var(--ov-signal-soft)] text-[var(--ov-signal-strong)]"
                : sceneState === "pitching"
                  ? "border-[var(--ov-negotiation)] bg-[var(--ov-negotiation-soft)] text-[var(--ov-negotiation)]"
                  : "border-[var(--ov-border-medium)] bg-[rgba(10,13,11,0.8)] text-[var(--ov-text-muted)]",
          )}
        >
          {sceneState === "idle" && "3 → AWAITING PITCH"}
          {sceneState === "pitching" && "PITCH LIVE"}
          {sceneState === "evaluating" && "EVALUATING"}
          {sceneState === "verdict" && "VERDICT REACHED"}
        </span>
      </div>

      {/* SVG beams — finalists pointing DOWN to job agent */}
      <svg
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        style={{ borderRadius: "2rem", overflow: "visible" }}
      >
        <defs>
          <style>{`
            @keyframes drawBeam {
              from { stroke-dashoffset: 300; opacity: 0; }
              to { stroke-dashoffset: 0; opacity: 1; }
            }
            .beam-active {
              animation: drawBeam 0.9s ease-out forwards;
            }
            .beam-winner {
              animation: drawBeam 0.6s ease-out forwards;
            }
          `}</style>
        </defs>
        {finalists.map((finalist, index) => {
          const pos = finalistPositions[index] ?? finalistPositions[0];
          const isWinner = winnerAgentId === finalist.agentId;
          const isVerdictLost =
            sceneState === "verdict" && winnerAgentId != null && !isWinner;

          return (
            <line
              key={finalist.agentId}
              x1={`${pos.x}%`}
              y1={`${pos.y}%`}
              x2={`${jobAgentPosition.x}%`}
              y2={`${jobAgentPosition.y}%`}
              strokeWidth={isWinner ? 2.5 : 1.5}
              strokeDasharray="300"
              strokeDashoffset={sceneState === "idle" ? 300 : 0}
              className={
                sceneState !== "idle"
                  ? isWinner
                    ? "beam-winner"
                    : "beam-active"
                  : ""
              }
              style={{
                stroke: isWinner
                  ? "var(--ov-stroke-winner)"
                  : isVerdictLost
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(255,255,255,0.18)",
                transition:
                  "stroke 0.8s ease-out, opacity 0.8s ease-out",
                animationDelay: `${index * 250}ms`,
                opacity: sceneState === "idle" ? 0 : 1,
              }}
            />
          );
        })}
      </svg>

      {/* Finalist nodes — in the middle band */}
      {finalists.map((finalist, index) => {
        const pos = finalistPositions[index] ?? finalistPositions[0];
        const isWinner = winnerAgentId === finalist.agentId;
        const isVerdictLost =
          sceneState === "verdict" && winnerAgentId != null && !isWinner;
        const isRevealed = revealedIndices.has(index);
        const bubbleText = getBubbleText(finalist, sceneState);

        return (
          <div key={finalist.agentId}>
            {/* Thought bubble — above the node */}
            <div
              className="absolute z-20"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translateX(-50%)",
              }}
            >
              {/* Bubble positioned upward from node center */}
              <div className="absolute bottom-[calc(100%+8px)] left-1/2 w-52 -translate-x-1/2 sm:w-60">
                <ThoughtBubble
                  text={bubbleText || ""}
                  visible={sceneState !== "idle" && isRevealed && !!bubbleText}
                />
              </div>

              {/* Node dot */}
              <div
                className={cn(
                  "rounded-full border backdrop-blur-sm transition-all duration-700",
                  isWinner
                    ? "size-7 -translate-x-1/2 -translate-y-1/2 border-[var(--ov-glow-winner)] bg-[var(--ov-winner-soft)] shadow-[0_0_40px_var(--ov-glow-winner)] [animation:ov-pulse_2s_ease-in-out_infinite]"
                    : isVerdictLost
                      ? "size-5 -translate-x-1/2 -translate-y-1/2 border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] opacity-30"
                      : "size-5 -translate-x-1/2 -translate-y-1/2 border-[var(--ov-negotiation)] bg-[var(--ov-negotiation-soft)] shadow-[0_0_28px_var(--ov-glow-negotiation)]",
                )}
              />

              {/* Label card — below node */}
              <div
                className={cn(
                  "absolute left-1/2 top-[calc(50%+16px)] w-max max-w-[10rem] -translate-x-1/2 rounded-xl border px-3 py-2 text-center transition-all duration-500",
                  isWinner
                    ? "border-[var(--ov-winner-border)] bg-[rgba(10,13,11,0.92)]"
                    : isVerdictLost
                      ? "border-[var(--ov-border-soft)] bg-[rgba(10,13,11,0.5)] opacity-30"
                      : "border-[var(--ov-border-medium)] bg-[rgba(10,13,11,0.82)]",
                )}
              >
                <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--ov-text-muted)] uppercase">
                  #{finalist.rank} finalist
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--ov-text)] leading-snug">
                  {finalist.name}
                </p>
                {finalist.negotiatedPriceLabel ? (
                  <p className="mt-1 text-[11px] text-[var(--ov-text-muted)]">
                    {finalist.negotiatedPriceLabel}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      {/* Job Agent — central bottom node (the hiring agent / job poster) */}
      <div
        className="absolute z-20"
        style={{
          left: `${jobAgentPosition.x}%`,
          top: `${jobAgentPosition.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Outer glow ring */}
        <div
          className={cn(
            "absolute -inset-4 rounded-full transition-all duration-700",
            sceneState === "verdict"
              ? "bg-[radial-gradient(ellipse,var(--ov-winner-soft),transparent_70%)] opacity-80"
              : "bg-[radial-gradient(ellipse,var(--ov-negotiation-soft),transparent_70%)] opacity-60",
          )}
        />

        {/* Main node */}
        <div
          className={cn(
            "relative size-12 rounded-full border-2 backdrop-blur-sm transition-all duration-700",
            sceneState === "verdict"
              ? "border-[var(--ov-winner-border)] bg-[var(--ov-winner-soft)] shadow-[0_0_60px_var(--ov-glow-winner)] [animation:ov-pulse_2.5s_ease-in-out_infinite]"
              : "border-[var(--ov-signal-border)] bg-[var(--ov-signal-soft)] shadow-[0_0_48px_var(--ov-glow-signal)] [animation:ov-pulse_3s_ease-in-out_infinite]",
          )}
        />

        {/* Label */}
        <div className="absolute left-1/2 top-full mt-3 w-max -translate-x-1/2 text-center">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--ov-signal-strong)] uppercase">
            Job Agent
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--ov-text-muted)]">
            {sceneState === "verdict" ? "Decision reached" : "Evaluating pitches"}
          </p>
        </div>
      </div>

      {/* Floating action buttons — bottom center of canvas */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {(sceneState === "idle" || sceneState === "pitching") && (
          <Button
            type="button"
            onClick={onRunNegotiations}
            disabled={!canRunNegotiations}
            className="rounded-2xl border border-[var(--ov-negotiation)] bg-[rgba(10,13,11,0.92)] px-5 py-2.5 text-sm font-semibold text-[var(--ov-negotiation)] backdrop-blur-md transition hover:bg-[var(--ov-negotiation-soft)] disabled:opacity-40"
          >
            {isNegotiating ? "Negotiating..." : "Run negotiations"}
          </Button>
        )}
        {(sceneState === "pitching" || sceneState === "evaluating") && (
          <Button
            type="button"
            onClick={onSelectWinner}
            disabled={!canSelectWinner}
            className="rounded-2xl border border-[var(--ov-winner-border)] bg-[rgba(10,13,11,0.92)] px-5 py-2.5 text-sm font-semibold text-[var(--ov-winner)] backdrop-blur-md transition hover:bg-[var(--ov-winner-soft)] disabled:opacity-40"
          >
            {isSelectingWinner ? "Selecting..." : "Select winner"}
          </Button>
        )}
      </div>

      {/* Empty state overlay */}
      {finalists.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[var(--ov-text-muted)] uppercase">
              Waiting for shortlist
            </p>
            <p className="mt-2 text-sm text-[var(--ov-text-muted)]">
              Run the market to surface three finalists
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
