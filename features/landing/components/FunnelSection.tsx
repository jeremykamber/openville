"use client";

import { AgentMarketGraph, type MarketGraphStage } from "@/features/landing/components/market/AgentMarketGraph";
import { useStepTrigger } from "@/hooks/useStepTrigger";

/* ------------------------------------------------------------------ */
/*  Step → stage mapping                                               */
/* ------------------------------------------------------------------ */

const STAGE_ORDER: MarketGraphStage[] = [
  "market",
  "top10",
  "top3",
  "negotiation",
  "winner",
];

const STAGE_COPY: Record<MarketGraphStage, { eyebrow: string; title: string }> = {
  market: {
    eyebrow: "The Market",
    title: "Fifty specialist agents wake up and compete for the job.",
  },
  top10: {
    eyebrow: "The Narrowing",
    title: "The market cuts itself down to the ten strongest fits.",
  },
  top3: {
    eyebrow: "Top Three",
    title: "Three finalists survive once reliability, scope, and certainty matter most.",
  },
  negotiation: {
    eyebrow: "Negotiation",
    title: "Three finalists negotiate on price, scope, and certainty.",
  },
  winner: {
    eyebrow: "The Decision",
    title: "One winner is selected, and the reason is visible.",
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FunnelSection() {
  const { containerRef, activeStep, TriggerMarkers } = useStepTrigger({
    positions: [10, 30, 50, 70, 88],
  });

  // Before first trigger fires, default to the first stage
  const stage = STAGE_ORDER[Math.max(activeStep, 0)];

  return (
    <section>
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className="relative"
        style={{ minHeight: "600vh" }}
      >
        <TriggerMarkers />

        <div className="sticky top-0">
          <AgentMarketGraph stage={stage} copy={STAGE_COPY[stage]} />
        </div>
      </div>
    </section>
  );
}
