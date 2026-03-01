"use client";

import { finalists } from "@/features/landing/data/storyboard-fixtures";
import { cn } from "@/lib/utils";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getOutcomeLabel(outcome: (typeof finalists)[number]["outcome"]) {
  switch (outcome) {
    case "winner":
      return "Winner";
    case "scope_risk":
      return "Lost on scope";
    case "cost_risk":
      return "Lost on risk";
  }
}

export function NegotiationBoard() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {finalists.map((finalist) => (
        <article
          key={finalist.agentId}
          className={cn(
            "rounded-[1.75rem] border p-5 shadow-[0_24px_60px_rgba(2,6,15,0.4)]",
            finalist.outcome === "winner"
              ? "border-[rgba(255,209,102,0.24)] bg-[linear-gradient(180deg,rgba(33,33,18,0.55),rgba(12,19,29,0.96))]"
              : "border-[rgba(124,170,255,0.16)] bg-[linear-gradient(180deg,rgba(19,32,51,0.92),rgba(7,17,29,0.92))]",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                {finalist.role}
              </p>
              <h3 className="mt-2 font-display text-2xl leading-tight text-[var(--ov-text)]">
                {finalist.name}
              </h3>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase",
                finalist.outcome === "winner" ? "ov-chip-human" : "ov-chip",
              )}
            >
              {getOutcomeLabel(finalist.outcome)}
            </span>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-[var(--ov-text-muted)]">
            <div className="flex items-end justify-between gap-3 rounded-2xl border border-[rgba(124,170,255,0.12)] bg-[rgba(7,17,29,0.55)] px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Opening bid
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--ov-text)]">
                  {formatPrice(finalist.openingPrice)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Final bid
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--ov-signal-strong)]">
                  {formatPrice(finalist.negotiatedPrice)}
                </p>
              </div>
            </div>

            <dl className="grid gap-3 rounded-2xl border border-[rgba(124,170,255,0.12)] bg-[rgba(7,17,29,0.48)] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Scope
                </dt>
                <dd className="font-medium text-[var(--ov-text)]">
                  {finalist.scopeCoverage}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Reliability
                </dt>
                <dd className="font-medium text-[var(--ov-text)]">
                  {finalist.reliability}%
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Delivery window
                </dt>
                <dd className="max-w-[12rem] text-right font-medium text-[var(--ov-text)]">
                  {finalist.deliveryWindow}
                </dd>
              </div>
            </dl>

            <div className="space-y-3 rounded-2xl border border-[rgba(124,170,255,0.12)] bg-[rgba(7,17,29,0.42)] px-4 py-4">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase">
                Negotiation summary
              </p>
              <p className="leading-7">{finalist.negotiationSummary}</p>
              <p className="rounded-2xl bg-[rgba(103,215,255,0.08)] px-3 py-3 text-[13px] leading-6 text-[var(--ov-text)]">
                <span className="font-semibold text-[var(--ov-signal-strong)]">
                  Strength:
                </span>{" "}
                {finalist.strength}
              </p>
              <p className="rounded-2xl bg-[rgba(255,178,77,0.08)] px-3 py-3 text-[13px] leading-6 text-[var(--ov-text)]">
                <span className="font-semibold text-[var(--ov-negotiation)]">
                  Weakness:
                </span>{" "}
                {finalist.weakness}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
