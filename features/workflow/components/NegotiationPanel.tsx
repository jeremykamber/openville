"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NegotiationOutcomeViewModel } from "@/features/workflow/client/types";

interface NegotiationPanelProps {
  status: "idle" | "loading" | "success" | "error";
  items: NegotiationOutcomeViewModel[];
  error: string | null;
  onSelectWinner: () => void;
  disabled: boolean;
  isSelectingWinner: boolean;
}

function statusClass(status: NegotiationOutcomeViewModel["status"]) {
  if (status === "completed") {
    return "ov-chip-success border-0";
  }

  if (status === "rejected") {
    return "border-0 bg-[var(--ov-negotiation-soft)] text-[var(--ov-negotiation)]";
  }

  return "border-0 bg-destructive/15 text-destructive";
}

export function NegotiationPanel({
  status,
  items,
  error,
  onSelectWinner,
  disabled,
  isSelectingWinner,
}: NegotiationPanelProps) {
  return (
    <Card className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] shadow-[0_20px_50px_var(--ov-shadow)]">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="ov-kicker">Step 6</p>
            <CardTitle className="mt-2 font-display text-xl text-[var(--ov-text)]">
              Negotiation outcomes
            </CardTitle>
          </div>
          <Badge className="border-0 bg-[var(--ov-negotiation-soft)] text-[var(--ov-negotiation)]">
            {items.length} threads
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" ? (
          <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
            Negotiations begin after the shortlist is ready.
          </p>
        ) : null}

        {status === "loading" ? (
          <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
            Buyer and seller agents are refining offers across the finalists.
          </p>
        ) : null}

        {status === "error" ? (
          <p className="text-sm leading-7 text-destructive">{error}</p>
        ) : null}

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={`${item.candidateId}-${item.status}`}
                className="rounded-[1.5rem] border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ov-text)]">
                      {item.candidateName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ov-text-muted)]">
                      {item.summary}
                    </p>
                  </div>
                  <Badge className={statusClass(item.status)}>
                    {item.statusLabel}
                  </Badge>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-[var(--ov-text-muted)] sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-[var(--ov-text)]">Final price</p>
                    <p className="mt-1">{item.priceLabel}</p>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--ov-text)]">Response</p>
                    <p className="mt-1">{item.responseLabel}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onSelectWinner}
            disabled={disabled}
            className="bg-[var(--ov-winner)] text-[var(--ov-text-on-accent)] hover:bg-[#e0b156]"
          >
            {isSelectingWinner ? "Selecting winner..." : "Select winner"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
