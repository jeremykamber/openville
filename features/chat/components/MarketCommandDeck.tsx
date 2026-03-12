"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { AgentMarketGraph, type MarketGraphStage } from "@/features/landing/components/market/AgentMarketGraph";
import type { EliminationCandidateViewModel, WorkflowHomepageControls } from "@/features/workflow/client/types";
import type { WorkflowStatusResponse } from "@/features/workflow/types";
import { cn } from "@/lib/utils";

interface MarketCommandDeckProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  controls: WorkflowHomepageControls;
  onSpeedChange: (speed: WorkflowHomepageControls["speed"]) => void;
  onBudgetChange: (budget: string) => void;
  stage: MarketGraphStage;
  stageCopy: {
    eyebrow: string;
    title: string;
  };
  readiness: WorkflowStatusResponse["readiness"] | "idle";
  resultCount: number;
  shortlistCount: number;
  winnerName: string | null;
  eliminationData?: EliminationCandidateViewModel[];
}

const SPEED_OPTIONS: Array<{
  value: WorkflowHomepageControls["speed"];
  label: string;
  caption: string;
}> = [
  { value: "fastest", label: "Fastest", caption: "Prioritize rapid turnaround" },
  { value: "balanced", label: "Balanced", caption: "Keep inferred buyer intent" },
  { value: "best_quality", label: "Best quality", caption: "Bias toward top-rated operators" },
];

function readinessLabel(readiness: MarketCommandDeckProps["readiness"]) {
  if (readiness === "idle") {
    return "Awaiting request";
  }

  return readiness === "live" ? "Market live" : readiness === "degraded" ? "Degraded mode" : "Offline";
}

export function MarketCommandDeck({
  value,
  onChange,
  onSubmit,
  disabled,
  controls,
  onSpeedChange,
  onBudgetChange,
  stage,
  stageCopy,
  readiness,
  resultCount,
  shortlistCount,
  winnerName,
  eliminationData,
}: MarketCommandDeckProps) {
  return (
    <section className="ov-panel-strong relative overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:p-8">
      <div className="absolute inset-0 ov-grid opacity-[0.08]" />
      <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-[var(--ov-signal-soft)] blur-3xl" />
      <div className="absolute -right-8 bottom-0 h-48 w-48 rounded-full bg-[var(--ov-negotiation-soft)] blur-3xl" />

      <div className="relative grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="ov-chip border-0 px-3 py-1 tracking-[0.18em] uppercase">
              Market command deck
            </Badge>
            <Badge className="ov-chip-human border-0 px-3 py-1 tracking-[0.18em] uppercase">
              Homepage primary route
            </Badge>
          </div>

          <div className="space-y-4">
            <p className="ov-kicker">Request. Rank. Negotiate. Select.</p>
            <h1 className="max-w-3xl font-display text-4xl leading-[0.95] text-[var(--ov-text)] sm:text-5xl lg:text-6xl">
              One buyer brief. A visible agent market. A winner selected on the same page.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--ov-text-muted)] sm:text-base">
              Enter the request, set the operating posture, inspect the inferred context, and
              run the REST workflow without leaving the command surface.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[var(--ov-border-medium)] bg-[rgba(10,13,11,0.72)] px-4 py-3">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                Readiness
              </p>
              <p className="mt-2 font-display text-2xl text-[var(--ov-text)]">{readinessLabel(readiness)}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--ov-border-medium)] bg-[rgba(10,13,11,0.72)] px-4 py-3">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                Ranked
              </p>
              <p className="mt-2 font-display text-2xl text-[var(--ov-text)]">{resultCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--ov-border-medium)] bg-[rgba(10,13,11,0.72)] px-4 py-3">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                Final state
              </p>
              <p className="mt-2 font-display text-xl text-[var(--ov-text)]">
                {winnerName ?? (shortlistCount > 0 ? `${shortlistCount} finalists live` : "Waiting on market")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] border border-[var(--ov-border-medium)] bg-[rgba(10,13,11,0.72)] p-4 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                  Speed profile
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {SPEED_OPTIONS.map((option) => {
                    const active = option.value === controls.speed;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onSpeedChange(option.value)}
                        className={cn(
                          "rounded-[1.3rem] border px-4 py-3 text-left transition",
                          active
                            ? "border-[var(--ov-signal-border)] bg-[var(--ov-signal-soft)] text-[var(--ov-text)] shadow-[0_0_0_1px_var(--ov-signal-border)]"
                            : "border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text-muted)] hover:border-[var(--ov-signal-hover)] hover:text-[var(--ov-text)]",
                        )}
                      >
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="mt-1 block text-xs leading-5">{option.caption}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="space-y-3">
                <span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                  Budget cap
                </span>
                <div className="rounded-[1.3rem] border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-4 py-3">
                  <div className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--ov-text-muted)]">
                    Canonical workflow field
                  </div>
                  <Input
                    type="number"
                    min="0"
                    placeholder="500"
                    value={controls.budget}
                    onChange={(event) => onBudgetChange(event.target.value)}
                    className="h-12 border-[var(--ov-border-medium)] bg-[rgba(14,18,16,0.72)] text-[var(--ov-text)]"
                  />
                </div>
              </label>
            </div>

            <RequestComposer
              value={value}
              onChange={onChange}
              onSubmit={onSubmit}
              disabled={disabled}
              variant="active"
              submitLabel="Prepare buyer brief"
              loadingLabel="Workflow busy..."
              examples={[
                "Fix storm-damaged gutters before Friday under $900 in Austin",
                "Find a top-rated event crew for a weekend rooftop launch in Los Angeles",
                "Need an emergency electrician tonight for a restaurant panel issue",
              ]}
              onExampleClick={onChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="ov-chip border-0 px-3 py-1 tracking-[0.18em] uppercase">
              Stage aware
            </Badge>
            <Badge className="ov-chip-success border-0 px-3 py-1 tracking-[0.18em] uppercase">
              50 to 10 to 3 to 1
            </Badge>
          </div>
          <AgentMarketGraph
            stage={stage}
            copy={stageCopy}
            layout="embedded"
            eliminationData={eliminationData}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-[var(--ov-border-medium)] bg-[rgba(10,13,11,0.72)] px-4 py-3">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                Retrieval
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ov-text)]">
                Typed workflow context drives the same search, shortlist, and negotiation pipeline.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--ov-border-medium)] bg-[rgba(10,13,11,0.72)] px-4 py-3">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                Negotiation
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ov-text)]">
                Finalists keep visible status, fallback warnings, and winner rationale in the same rail.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--ov-border-medium)] bg-[rgba(10,13,11,0.72)] px-4 py-3">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                Debug path
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ov-text)]">
                The LangGraph route stays available separately while this page remains the product surface.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
