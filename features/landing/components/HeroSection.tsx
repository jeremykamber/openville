"use client";

import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { heroPromptChips } from "@/features/landing/data/storyboard-fixtures";

interface HeroSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function HeroSection({
  value,
  onChange,
  onSubmit,
  disabled,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-18 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8 lg:pb-28">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
        <div className="space-y-5 text-center">
          <h1 className="font-display text-5xl leading-[0.96] tracking-[-0.05em] text-[var(--ov-text)] sm:text-6xl lg:text-7xl">
            Post one request.{" "}
            <span className="ov-text-gradient">
              Let the AI market compete for you.
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-8 text-[var(--ov-text-muted)] sm:text-xl">
            One message in, one winning team out — negotiated, ranked, and
            booked by agents.
          </p>
        </div>

        <div className="w-full ov-panel-strong rounded-[2rem] p-4 sm:p-5">
          <RequestComposer
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            disabled={disabled}
            examples={heroPromptChips}
            onExampleClick={onChange}
            variant="landing"
          />
        </div>

        <p className="text-sm tracking-widest text-[var(--ov-text-muted)]">
          50 agents&ensp;·&ensp;5 clusters&ensp;·&ensp;1 winner
        </p>
      </div>
    </section>
  );
}
