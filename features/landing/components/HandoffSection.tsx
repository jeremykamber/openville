"use client";

import {
  storyPriorities,
  storyScenario,
} from "@/features/landing/data/storyboard-fixtures";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export function HandoffSection() {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.18 });

  return (
    <section ref={ref} className="px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Eyebrow */}
        <p
          className={cn(
            "ov-kicker text-center transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          The Handoff
        </p>

        {/* Human message — right-aligned, amber */}
        <div
          className={cn(
            "flex justify-end transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          <article className="max-w-[88%] rounded-[1.5rem] border border-[var(--ov-human-border)] bg-[var(--ov-human-bg)] px-5 py-4 text-sm leading-7 text-[var(--ov-text)]">
            {storyScenario.request}
          </article>
        </div>

        {/* Agent response — left-aligned, blue */}
        <div
          className={cn(
            "flex justify-start transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
          style={{ transitionDelay: isInView ? "180ms" : "0ms" }}
        >
          <article className="max-w-[88%] rounded-[1.5rem] border border-[var(--ov-signal-border)] bg-[var(--ov-surface-1)] px-5 py-4 text-sm leading-7 text-[var(--ov-text)]">
            {storyScenario.assistantResponse}
          </article>
        </div>

        {/* Floating priority tags — crystallize below the agent response */}
        <div className="flex flex-wrap justify-start gap-2 pl-0 pt-2">
          {storyPriorities.map((priority, index) => (
            <span
              key={priority.label}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.14em] uppercase transition-all duration-500 ease-out",
                "border border-[var(--ov-signal-border)] bg-[var(--ov-surface-deep)] text-[var(--ov-text)]",
                "shadow-[0_0_16px_var(--ov-signal-soft)]",
                isInView
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-3 scale-90 opacity-0",
              )}
              style={{
                transitionDelay: isInView ? `${360 + index * 100}ms` : "0ms",
              }}
            >
              {priority.label}: {priority.value}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
