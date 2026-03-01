"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShortlistItemViewModel } from "@/features/workflow/client/types";

interface ShortlistPanelProps {
  searchStatus: "idle" | "loading" | "success" | "empty" | "error";
  items: ShortlistItemViewModel[];
  summary: string | null;
  error: string | null;
  onRunNegotiations: () => void;
  disabled: boolean;
  isRunning: boolean;
}

export function ShortlistPanel({
  searchStatus,
  items,
  summary,
  error,
  onRunNegotiations,
  disabled,
  isRunning,
}: ShortlistPanelProps) {
  return (
    <Card className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] shadow-[0_20px_50px_var(--ov-shadow)]">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="ov-kicker">Step 5</p>
            <CardTitle className="mt-2 font-display text-xl text-[var(--ov-text)]">
              Finalist shortlist
            </CardTitle>
          </div>
          <Badge className="border-0 bg-[var(--ov-winner-soft)] text-[var(--ov-winner)]">
            {items.length} finalists
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {searchStatus === "idle" ? (
          <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
            The shortlist appears after the market run completes.
          </p>
        ) : null}

        {searchStatus === "loading" ? (
          <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
            Ranking candidates and asking the backend to narrow them to the best
            three.
          </p>
        ) : null}

        {searchStatus === "error" ? (
          <p className="text-sm leading-7 text-destructive">{error}</p>
        ) : null}

        {searchStatus === "empty" ? (
          <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
            No candidates reached the shortlist yet. Adjust the brief and rerun
            the market.
          </p>
        ) : null}

        {summary ? (
          <p className="rounded-2xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-4 py-3 text-sm leading-7 text-[var(--ov-text-muted)]">
            {summary}
          </p>
        ) : null}

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <article
                key={item.agentId}
                className="rounded-[1.5rem] border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ov-text)]">
                      #{index + 1} {item.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ov-text-muted)]">
                      {item.serviceLabel}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="ov-chip border-0">{item.matchScore}</Badge>
                    <Badge className="ov-chip-human border-0">
                      {item.priceLabel}
                    </Badge>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--ov-text-muted)]">
                  {item.reasoning}
                </p>
              </article>
            ))}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onRunNegotiations}
            disabled={disabled || items.length === 0}
            className="bg-[var(--ov-negotiation)] text-[var(--ov-text-on-accent)] hover:bg-[#db8f58]"
          >
            {isRunning ? "Negotiating..." : "Run finalist negotiations"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
