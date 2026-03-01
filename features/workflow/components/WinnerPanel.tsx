"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WinnerSummaryViewModel } from "@/features/workflow/client/types";

interface WinnerPanelProps {
  status: "idle" | "loading" | "success" | "error";
  winner: WinnerSummaryViewModel | null;
  error: string | null;
}

export function WinnerPanel({ status, winner, error }: WinnerPanelProps) {
  return (
    <Card className="border-[var(--ov-winner-border)] bg-[var(--ov-gradient-winner)] shadow-[0_24px_60px_var(--ov-shadow-strong)]">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="ov-kicker">Step 7</p>
            <CardTitle className="mt-2 font-display text-xl text-[var(--ov-text)]">
              Winner summary
            </CardTitle>
          </div>
          {winner ? (
            <Badge className="border-0 bg-[var(--ov-winner-soft)] text-[var(--ov-winner)]">
              {winner.confidenceLabel}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" ? (
          <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
            Winner selection stays locked until negotiations return at least one
            transport-safe outcome.
          </p>
        ) : null}

        {status === "loading" ? (
          <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
            The reasoning layer is comparing the final offers and selecting the
            strongest fit for the buyer.
          </p>
        ) : null}

        {status === "error" ? (
          <p className="text-sm leading-7 text-destructive">{error}</p>
        ) : null}

        {winner ? (
          <>
            <div className="rounded-[1.5rem] border border-[var(--ov-winner-border)] bg-[rgba(14,18,16,0.55)] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[var(--ov-text-muted)]">Chosen operator</p>
                  <p className="mt-1 font-display text-2xl text-[var(--ov-text)]">
                    {winner.candidateName}
                  </p>
                </div>
                <Badge className="ov-chip-human border-0">{winner.priceLabel}</Badge>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--ov-text-muted)]">
                {winner.reasoning}
              </p>
              <p className="mt-3 text-sm font-medium text-[var(--ov-text)]">
                {winner.summary}
              </p>
            </div>

            <div className="space-y-3">
              {winner.comparison.map((entry) => (
                <article
                  key={entry.candidateId}
                  className="rounded-[1.5rem] border border-[var(--ov-border-medium)] bg-[rgba(14,18,16,0.55)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--ov-text)]">
                      {entry.candidateName}
                    </p>
                    <Badge className="ov-chip border-0">
                      {entry.priorityAlignmentLabel}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-[var(--ov-text-muted)] md:grid-cols-2">
                    <div>
                      <p className="font-medium text-[var(--ov-text)]">Strengths</p>
                      <p className="mt-1">
                        {entry.strengths.length > 0
                          ? entry.strengths.join(", ")
                          : "None recorded"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--ov-text)]">Weaknesses</p>
                      <p className="mt-1">
                        {entry.weaknesses.length > 0
                          ? entry.weaknesses.join(", ")
                          : "None recorded"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
