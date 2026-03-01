"use client";

import { pastFragments } from "@/features/landing/data/storyboard-fixtures";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const fragmentLayout = [
  "sm:translate-x-2 sm:-rotate-6",
  "sm:-translate-y-6 sm:translate-x-14 sm:rotate-3",
  "sm:translate-y-8 sm:-translate-x-5 sm:-rotate-3",
  "sm:-translate-y-3 sm:translate-x-10 sm:rotate-5",
  "sm:translate-y-5 sm:-translate-x-8 sm:-rotate-4",
];

const fragmentTone = {
  quote: "border-[rgba(242,191,122,0.22)] bg-[rgba(42,28,12,0.44)]",
  call: "border-[rgba(255,178,77,0.2)] bg-[rgba(45,26,10,0.42)]",
  schedule: "border-[rgba(148,164,188,0.2)] bg-[rgba(29,34,44,0.48)]",
  staffing: "border-[rgba(242,191,122,0.18)] bg-[rgba(39,26,13,0.42)]",
  ops: "border-[rgba(148,164,188,0.18)] bg-[rgba(22,29,41,0.52)]",
} as const;

export function OldWaySection() {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.2 });

  return (
    <section ref={ref} className="px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div
          className={cn(
            "space-y-5 transition-all duration-700 ease-out",
            isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          <p className="ov-kicker">The Past</p>
          <h2 className="font-display text-4xl leading-tight text-[var(--ov-text)] sm:text-5xl">
            Before AI, saving an event meant running the whole market yourself.
          </h2>
          <p className="ov-section-copy">
            Quotes lived in one tab, staffing texts in another, and the clock
            kept moving either way. The problem was never just finding one
            vendor. It was stitching together a full response while the deadline
            was already slipping.
          </p>
        </div>

        <div
          className={cn(
            "ov-panel relative overflow-hidden rounded-[2rem] p-5 transition-all duration-700 ease-out sm:p-7",
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,191,122,0.12),transparent_30%)]" />
          <div className="grid gap-4 sm:grid-cols-2">
            {pastFragments.map((fragment, index) => (
              <article
                key={fragment.id}
                className={cn(
                  "rounded-[1.5rem] border border-dashed px-5 py-4 text-left shadow-[0_20px_50px_rgba(4,8,15,0.3)] transition-all duration-700 ease-out",
                  fragmentTone[fragment.type],
                  fragmentLayout[index],
                  isInView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0",
                )}
                style={{
                  transitionDelay: isInView ? `${index * 110}ms` : "0ms",
                }}
              >
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--ov-human)] uppercase">
                  {fragment.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--ov-text)]">
                  {fragment.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
