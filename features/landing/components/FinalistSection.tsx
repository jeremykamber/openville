"use client";

import { PriorityRail } from "@/features/landing/components/market/PriorityRail";
import { WinnerBlock } from "@/features/landing/components/market/WinnerBlock";
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
          <PriorityRail />
        </div>

        <div
          className={cn(
            "transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{ transitionDelay: isInView ? "120ms" : "0ms" }}
        >
          <WinnerBlock />
        </div>
      </div>
    </section>
  );
}
