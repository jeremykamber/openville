"use client";

import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { lifecycleSteps } from "@/features/landing/data/storyboard-fixtures";
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
    <section
      ref={ref}
      className="px-4 pb-24 pt-18 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8"
    >
      <div className="mx-auto max-w-3xl space-y-16">
        {/* ── Vertical timeline ── */}
        <div className="relative mx-auto max-w-md pl-10">
          {/* Vertical line */}
          <div
            className={cn(
              "absolute left-3 top-1 bottom-1 w-px transition-all duration-700 ease-out",
              isInView
                ? "bg-[var(--ov-border)] opacity-100"
                : "bg-transparent opacity-0",
            )}
          />

          <div className="space-y-10">
            {lifecycleSteps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "relative transition-all duration-700 ease-out",
                  isInView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                )}
                style={{
                  transitionDelay: isInView ? `${index * 150}ms` : "0ms",
                }}
              >
                {/* Dot */}
                <span
                  className={cn(
                    "absolute -left-10 top-0.5 block h-2.5 w-2.5 rounded-full border border-[var(--ov-border)] transition-colors duration-500",
                    isInView
                      ? "bg-[var(--ov-signal)] border-[var(--ov-signal)]"
                      : "bg-transparent",
                  )}
                  style={{
                    transitionDelay: isInView ? `${index * 150 + 100}ms` : "0ms",
                  }}
                />
                <p className="text-sm font-semibold tracking-widest text-[var(--ov-text)] uppercase">
                  {step.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--ov-text-muted)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA panel ── */}
        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem] p-6 sm:p-10 transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{
            transitionDelay: isInView ? "500ms" : "0ms",
            border: "1px solid var(--ov-winner-border)",
            background:
              "var(--ov-gradient-winner), var(--ov-gradient-card-strong)",
            boxShadow:
              "0 28px 80px var(--ov-shadow-strong), inset 0 1px 0 var(--ov-winner-soft)",
          }}
        >
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[80%] rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse, var(--ov-glow-winner), transparent 70%)",
            }}
          />

          <div className="relative space-y-6 text-center">
            <p className="ov-kicker">The Result</p>
            <h2 className="font-display text-4xl leading-tight text-[var(--ov-text)] sm:text-5xl lg:text-6xl">
              Your agent handled the market.
            </h2>
            <p className="mx-auto max-w-lg text-[var(--ov-text-muted)] text-lg leading-relaxed">
              The confirmation arrives and the human only re-enters when it
              matters.
            </p>
            <div className="mx-auto max-w-xl pt-2">
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
      </div>
    </section>
  );
}
