"use client";

import {
  finalists,
  type FinalistNegotiation,
} from "@/features/landing/data/storyboard-fixtures";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function lossReason(outcome: FinalistNegotiation["outcome"]): string {
  switch (outcome) {
    case "scope_risk":
      return "Incomplete coverage";
    case "cost_risk":
      return "Surge pricing risk";
    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WinnerBlock() {
  const winner = finalists.find((f) => f.outcome === "winner");
  const losers = finalists.filter((f) => f.outcome !== "winner");

  if (!winner) return null;

  return (
    <div className="space-y-6">
      {/* ---- Winner stat block ---- */}
      <article className="rounded-[1.75rem] border border-[var(--ov-winner-border)] p-6 shadow-[0_28px_80px_var(--ov-shadow-strong)] sm:p-8" style={{ background: "var(--ov-gradient-winner), var(--ov-gradient-card-strong)" }}>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--ov-winner)] uppercase">
          Winner
        </p>
        <h3 className="mt-2 font-display text-3xl leading-tight text-[var(--ov-text)] sm:text-4xl">
          {winner.name}
        </h3>

        {/* Three stat columns */}
        <div className="mt-6 grid grid-cols-3 gap-4 sm:gap-6">
          {/* Bid delta */}
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
              Bid
            </p>
            <p className="mt-1 text-xl font-semibold text-[var(--ov-text)] sm:text-2xl">
              <span className="text-[var(--ov-text-muted)] line-through">
                {formatPrice(winner.openingPrice)}
              </span>{" "}
              <span className="text-[var(--ov-signal-strong)]">
                {formatPrice(winner.negotiatedPrice)}
              </span>
            </p>
          </div>

          {/* Reliability */}
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
              Reliable
            </p>
            <p className="mt-1 text-xl font-semibold text-[var(--ov-text)] sm:text-2xl">
              {winner.reliability}%
            </p>
          </div>

          {/* Scope */}
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
              Scope
            </p>
            <div className="mt-2 flex gap-1">
              <div className="h-1.5 flex-1 rounded-full bg-[var(--ov-glow-signal)]" />
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  winner.scopeCoverage === "full"
                    ? "bg-[var(--ov-glow-signal)]"
                    : "bg-[var(--ov-border-soft)]",
                )}
              />
            </div>
            <p className="mt-1 text-sm font-medium text-[var(--ov-text)]">
              {winner.scopeCoverage === "full" ? "Full" : "Partial"}
            </p>
          </div>
        </div>

        {/* Delivery window */}
        <p className="mt-5 text-sm leading-7 text-[var(--ov-text-muted)]">
          {winner.deliveryWindow}
        </p>
      </article>

      {/* ---- Loser rows ---- */}
      <div className="space-y-px">
        {losers.map((loser) => (
          <div
            key={loser.agentId}
            className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-[var(--ov-border-soft)] px-2 py-3 text-sm text-[var(--ov-text-muted)]"
          >
            <span className="font-medium text-[var(--ov-text)]">
              {loser.name}
            </span>
            <span>{formatPrice(loser.negotiatedPrice)}</span>
            <span>{loser.scopeCoverage} scope</span>
            <span className="text-[var(--ov-negotiation)]">
              Lost: {lossReason(loser.outcome)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
