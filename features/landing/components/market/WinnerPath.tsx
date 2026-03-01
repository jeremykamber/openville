"use client";

import {
  loserExplanations,
  winnerExplanation,
} from "@/features/landing/data/storyboard-fixtures";

export function WinnerPath() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-[1.75rem] border border-[rgba(255,209,102,0.24)] bg-[linear-gradient(180deg,rgba(36,32,18,0.62),rgba(12,19,29,0.96))] p-6 shadow-[0_28px_80px_rgba(6,10,18,0.45)]">
        <p className="ov-kicker text-[var(--ov-winner)]">The Decision</p>
        <h3 className="mt-3 font-display text-3xl leading-tight text-[var(--ov-text)]">
          One winner is selected, and the reason is visible.
        </h3>
        <p className="mt-4 text-base leading-8 text-[var(--ov-text-muted)]">
          {winnerExplanation}
        </p>
      </article>

      <div className="grid gap-4">
        {loserExplanations.map((explanation) => (
          <article
            key={explanation}
            className="rounded-[1.5rem] border border-[rgba(124,170,255,0.16)] bg-[rgba(9,17,29,0.82)] p-5 text-sm leading-7 text-[var(--ov-text-muted)]"
          >
            {explanation}
          </article>
        ))}
      </div>
    </div>
  );
}
