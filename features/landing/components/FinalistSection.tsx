"use client";

import { NegotiationBoard } from "@/features/landing/components/market/NegotiationBoard";
import { PriorityRail } from "@/features/landing/components/market/PriorityRail";
import { WinnerPath } from "@/features/landing/components/market/WinnerPath";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export function FinalistSection() {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  return (
    <section ref={ref} className="px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div
          className={cn(
            "space-y-5 transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          <p className="ov-kicker">Negotiation</p>
          <h2 className="font-display text-4xl leading-tight text-[var(--ov-text)] sm:text-5xl">
            Three finalists negotiate on price, scope, and certainty.
          </h2>
          <p className="max-w-3xl ov-section-copy">
            This is the decision room. One finalist loses on incomplete scope.
            One loses on cost and execution risk. One wins because it protects
            the launch without forcing the human back into manual coordination.
          </p>
          <PriorityRail />
        </div>

        <div
          className={cn(
            "transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{ transitionDelay: isInView ? "120ms" : "0ms" }}
        >
          <NegotiationBoard />
        </div>

        <div
          className={cn(
            "transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{ transitionDelay: isInView ? "240ms" : "0ms" }}
        >
          <WinnerPath />
        </div>
      </div>
    </section>
  );
}
