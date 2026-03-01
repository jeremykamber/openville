"use client";

import { AgentMarketGraph, type MarketGraphStage } from "@/features/landing/components/market/AgentMarketGraph";
import { PriorityRail } from "@/features/landing/components/market/PriorityRail";
import { useScrollProgress } from "@/hooks/useScrollProgress";

const STAGES: { threshold: number; stage: MarketGraphStage }[] = [
  { threshold: 0.18, stage: "market" },
  { threshold: 0.38, stage: "top10" },
  { threshold: 0.58, stage: "top3" },
  { threshold: 0.78, stage: "negotiation" },
  { threshold: 1, stage: "winner" },
];

const STAGE_COPY: Record<
  MarketGraphStage,
  { eyebrow: string; title: string; body: string }
> = {
  market: {
    eyebrow: "The Market",
    title: "Fifty specialist agents wake up and compete for the job.",
    body: "AV crews, staffing reps, venue ops, logistics, and contingency agents all push for the work at once.",
  },
  top10: {
    eyebrow: "The Narrowing",
    title: "The market cuts itself down to the ten strongest fits.",
    body: "Weak scope, soft availability, and poor trade-offs drop out before you ever see them.",
  },
  top3: {
    eyebrow: "Top Three",
    title: "Three finalists survive once reliability, scope, and certainty matter most.",
    body: "At this point the question is no longer who can respond. It is who can cover the whole launch without introducing new risk.",
  },
  negotiation: {
    eyebrow: "Negotiation",
    title: "Three finalists negotiate on price, scope, and certainty.",
    body: "Your agent pressures the finalists for better terms while protecting the deadline and full event scope.",
  },
  winner: {
    eyebrow: "The Decision",
    title: "One winner is selected, and the reason is visible.",
    body: "The final choice is not magic. It is a clear trade-off between cost, scope coverage, and execution risk.",
  },
};

function getStage(progress: number) {
  return STAGES.find((entry) => progress <= entry.threshold)?.stage ?? "winner";
}

export function FunnelSection() {
  const { ref, progress } = useScrollProgress<HTMLElement>();
  const stage = getStage(progress);

  return (
    <section ref={ref} className="px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
      <div className="relative mx-auto max-w-6xl" style={{ minHeight: "280vh" }}>
        <div className="sticky top-6 space-y-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-[rgba(124,170,255,0.12)] bg-[rgba(7,17,29,0.72)] px-5 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <PriorityRail />
            <div className="rounded-full border border-[rgba(103,215,255,0.18)] bg-[rgba(103,215,255,0.12)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-signal-strong)] uppercase">
              {stage === "market"
                ? "50 -> market open"
                : stage === "top10"
                  ? "10 -> ranked survivors"
                  : stage === "top3"
                    ? "3 -> finalists"
                    : stage === "negotiation"
                      ? "3 -> negotiation live"
                      : "1 -> winner selected"}
            </div>
          </div>

          <AgentMarketGraph stage={stage} copy={STAGE_COPY[stage]} />
        </div>
      </div>
    </section>
  );
}
