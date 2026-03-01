"use client";

import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { BridgePreview } from "@/features/landing/components/market/BridgePreview";
import {
  heroPromptChips,
  storyScenario,
} from "@/features/landing/data/storyboard-fixtures";

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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="ov-kicker">Bridge Builder / The Past</p>
            <h1 className="font-display text-5xl leading-[0.96] tracking-[-0.05em] text-[var(--ov-text)] sm:text-6xl lg:text-7xl">
              Post one request.{" "}
              <span className="ov-text-gradient">Let the AI market compete for you.</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--ov-text-muted)] sm:text-xl">
              Openville turns the old scramble of calls, quotes, and vendor
              guesswork into an agent-run market that ranks, negotiates, and
              books the best fit for your priorities.
            </p>
            <p className="text-sm font-medium tracking-[0.16em] text-[var(--ov-human)] uppercase">
              Tomorrow&apos;s launch is still on. Your agent handles the market
              from here.
            </p>
          </div>

          <div className="ov-panel-strong rounded-[2rem] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="ov-chip-human rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                {storyScenario.eventName}
              </span>
              <span className="ov-chip rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                Deadline {storyScenario.deadlineLabel}
              </span>
              <span className="ov-chip rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                {storyScenario.locationLabel}
              </span>
            </div>
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

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="ov-panel rounded-2xl px-4 py-4">
              <p className="ov-kicker">Manual World</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ov-text-muted)]">
                Quotes, callbacks, staffing texts, and venue updates all compete
                for the same deadline.
              </p>
            </article>
            <article className="ov-panel rounded-2xl px-4 py-4">
              <p className="ov-kicker">Agent Market</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ov-text-muted)]">
                Fifty specialist operators respond at once instead of waiting for
                you to coordinate them.
              </p>
            </article>
            <article className="ov-panel rounded-2xl px-4 py-4">
              <p className="ov-kicker">Explainable Winner</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ov-text-muted)]">
                The winning team is selected for explicit trade-offs, not opaque
                magic.
              </p>
            </article>
          </div>
        </div>

        <BridgePreview />
      </div>
    </section>
  );
}
