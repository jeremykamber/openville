"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkflowExecutionMeta, WorkflowStatusResponse } from "@/features/workflow/types";

interface WorkflowStatusPanelProps {
  status: {
    status: "idle" | "loading" | "success" | "error";
    data: WorkflowStatusResponse | null;
    error: string | null;
  };
  latestExecutionMeta: Partial<WorkflowExecutionMeta> | null;
  onRefresh: () => void;
}

function toneClass(readiness: WorkflowStatusResponse["readiness"]) {
  if (readiness === "live") {
    return "ov-chip-success border-0";
  }

  if (readiness === "degraded") {
    return "border-0 bg-[var(--ov-negotiation-soft)] text-[var(--ov-negotiation)]";
  }

  return "border-0 bg-destructive/15 text-destructive";
}

export function WorkflowStatusPanel({
  status,
  latestExecutionMeta,
  onRefresh,
}: WorkflowStatusPanelProps) {
  const warnings =
    latestExecutionMeta?.warnings?.length
      ? latestExecutionMeta.warnings
      : status.data?.warnings ?? [];

  return (
    <Card className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] shadow-[0_20px_50px_var(--ov-shadow)]">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="ov-kicker">Workflow status</p>
            <CardTitle className="mt-2 font-display text-xl text-[var(--ov-text)]">
              Backend readiness
            </CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRefresh}
            className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text-muted)] hover:bg-[var(--ov-surface-1)] hover:text-[var(--ov-text)]"
          >
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.status === "error" ? (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{status.error}</p>
          </div>
        ) : null}

        {status.data ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={toneClass(status.data.readiness)}>
                {status.data.readiness}
              </Badge>
              <Badge className="ov-chip border-0">
                market: {status.data.marketData.source}
              </Badge>
              <Badge className="ov-chip border-0">
                retrieval: {latestExecutionMeta?.retrievalMode ?? status.data.retrieval.mode}
              </Badge>
              <Badge className="ov-chip border-0">
                llm: {latestExecutionMeta?.llmProvider ?? status.data.llm.provider}
              </Badge>
            </div>

            <div className="grid gap-3 text-sm text-[var(--ov-text-muted)] sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-4 py-3">
                <p className="font-medium text-[var(--ov-text)]">Market source</p>
                <p className="mt-1">
                  {status.data.marketData.candidateCount} candidates available
                  {status.data.marketData.seeded ? " via seeded fallback" : " from Supabase"}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-4 py-3">
                <p className="font-medium text-[var(--ov-text)]">Execution mode</p>
                <p className="mt-1">
                  {latestExecutionMeta?.mode ?? status.data.readiness} execution
                  {latestExecutionMeta?.fallbacksUsed?.length
                    ? ` with ${latestExecutionMeta.fallbacksUsed.join(", ")}`
                    : ""}
                </p>
              </div>
            </div>

            {warnings.length > 0 ? (
              <div className="space-y-2 rounded-2xl border border-[var(--ov-negotiation)] bg-[var(--ov-negotiation-soft)] px-4 py-3">
                <p className="text-sm font-medium text-[var(--ov-text)]">
                  Visible fallback signals
                </p>
                <ul className="space-y-1 text-sm leading-6 text-[var(--ov-text-muted)]">
                  {warnings.map((warning) => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
            {status.status === "loading"
              ? "Reading current backend readiness."
              : "Status will load when the workspace prepares a request."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
