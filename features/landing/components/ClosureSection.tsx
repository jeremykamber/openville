"use client";

import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { lifecycleSteps, storyScenario } from "@/features/landing/data/storyboard-fixtures";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface ClosureSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function ClosureSection({
  value,
  onChange,
  onSubmit,
  disabled,
}: ClosureSectionProps) {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  return (
    <section ref={ref} className="px-4 pb-24 pt-18 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div
          className={cn(
            "grid gap-5 lg:grid-cols-3 transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          {lifecycleSteps.map((step, index) => (
            <article
              key={step.id}
              className="ov-panel rounded-[1.75rem] px-5 py-5"
              style={{ transitionDelay: isInView ? `${index * 120}ms` : "0ms" }}
            >
              <p className="ov-kicker">{step.label}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--ov-text-muted)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div
          className={cn(
            "ov-panel-strong rounded-[2rem] p-6 sm:p-8 transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{ transitionDelay: isInView ? "220ms" : "0ms" }}
        >
          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div className="space-y-5">
              <p className="ov-kicker">The Future</p>
              <h2 className="font-display text-4xl leading-tight text-[var(--ov-text)] sm:text-5xl">
                You get the booking. Your agent handled the market.
              </h2>
              <p className="ov-section-copy">
                The launch gets covered, the confirmation arrives, and the human
                only re-enters when it matters. That is the bridge from manual
                coordination to an explainable AI economy.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="ov-chip rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                  {storyScenario.eventName}
                </span>
                <span className="ov-chip-human rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Budget stance: controlled
                </span>
              </div>
            </div>

            <RequestComposer
              value={value}
              onChange={onChange}
              onSubmit={onSubmit}
              disabled={disabled}
              variant="landing"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
