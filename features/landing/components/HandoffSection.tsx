"use client";

import { PriorityRail } from "@/features/landing/components/market/PriorityRail";
import { storyScenario } from "@/features/landing/data/storyboard-fixtures";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export function HandoffSection() {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.18 });

  return (
    <section ref={ref} className="px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div
          className={cn(
            "ov-panel-strong rounded-[2rem] p-5 transition-all duration-700 ease-out sm:p-6",
            isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          <p className="ov-kicker">The Handoff</p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-[var(--ov-text)] sm:text-5xl">
            One request replaces the scramble.
          </h2>
          <p className="mt-4 ov-section-copy">
            Your agent extracts the job, the deadline, and the trade-offs
            without making you manage the market by hand.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex justify-end">
              <article className="max-w-[85%] rounded-[1.5rem] border border-[rgba(242,191,122,0.24)] bg-[rgba(242,191,122,0.1)] px-5 py-4 text-sm leading-7 text-[var(--ov-text)]">
                {storyScenario.request}
              </article>
            </div>
            <div
              className={cn(
                "flex justify-start transition-all duration-700 ease-out",
                isInView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: isInView ? "180ms" : "0ms" }}
            >
              <article className="max-w-[85%] rounded-[1.5rem] border border-[rgba(124,170,255,0.18)] bg-[rgba(19,32,51,0.82)] px-5 py-4 text-sm leading-7 text-[var(--ov-text)]">
                {storyScenario.assistantResponse}
              </article>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "space-y-5 transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{ transitionDelay: isInView ? "120ms" : "0ms" }}
        >
          <article className="ov-panel rounded-[2rem] p-5 sm:p-6">
            <p className="ov-kicker text-[var(--ov-human)]">
              Human intention -&gt; agent understanding -&gt; market activation
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--ov-text-muted)]">
              The bridge is literal here. Manual fragments collapse into parsed
              priorities, and those priorities become the operating rules for
              the market.
            </p>
          </article>

          <article className="ov-panel rounded-[2rem] p-5 sm:p-6">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
              Extracted priorities
            </p>
            <div className="mt-4">
              <PriorityRail emphasizeHuman />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
