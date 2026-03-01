"use client";

import { pastFragments } from "@/features/landing/data/storyboard-fixtures";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

/* Each shard gets a unique scatter position — rotation, offset, opacity */
const shardStyles: React.CSSProperties[] = [
  { top: "8%", left: "6%", transform: "rotate(-7deg)", opacity: 0.7 },
  { top: "26%", left: "52%", transform: "rotate(4deg)", opacity: 0.5 },
  { top: "48%", left: "14%", transform: "rotate(-3deg)", opacity: 0.85 },
  { top: "62%", left: "44%", transform: "rotate(6deg)", opacity: 0.45 },
  { top: "80%", left: "8%", transform: "rotate(-5deg)", opacity: 0.6 },
];

export function OldWaySection() {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.2 });

  return (
    <section ref={ref} className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
        {/* Left: chaotic shard field */}
        <div
          className={cn(
            "relative h-64 select-none overflow-hidden blur-[0.5px] saturate-[0.4] transition-all duration-700 ease-out sm:h-80",
            isInView ? "opacity-100" : "opacity-0",
          )}
        >
          {pastFragments.map((fragment, index) => (
            <span
              key={fragment.id}
              className="absolute text-sm font-medium leading-none text-[var(--ov-text-muted)] sm:text-base"
              style={shardStyles[index]}
            >
              {fragment.detail}
            </span>
          ))}
        </div>

        {/* Right: one bold line */}
        <p
          className={cn(
            "font-display text-3xl leading-tight text-[var(--ov-text)] transition-all duration-700 ease-out sm:text-4xl lg:text-5xl",
            isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          This is what everyone else is still doing.
        </p>
      </div>
    </section>
  );
}
