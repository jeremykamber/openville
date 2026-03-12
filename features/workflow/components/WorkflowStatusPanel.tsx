"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    <section className="rounded-2xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
          Workflow status
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1 text-[10px] font-medium text-[var(--ov-text-muted)] hover:text-[var(--ov-text)]"
        >
          <RefreshCcw className="size-3" />
          Refresh
        </button>
      </div>

      {status.status === "error" && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <p className="text-xs leading-5">{status.error}</p>
        </div>
      )}

      {status.data ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
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

          <div className="grid gap-2 text-xs text-[var(--ov-text-muted)] sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-3 py-2">
              <p className="font-medium text-[var(--ov-text)]">Market</p>
              <p className="mt-0.5">
                {status.data.marketData.candidateCount} candidates
                {status.data.marketData.seeded ? " (seeded)" : ""}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-3 py-2">
              <p className="font-medium text-[var(--ov-text)]">Mode</p>
              <p className="mt-0.5">
                {latestExecutionMeta?.mode ?? status.data.readiness}
                {latestExecutionMeta?.fallbacksUsed?.length
                  ? ` + ${latestExecutionMeta.fallbacksUsed.join(", ")}`
                  : ""}
              </p>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="rounded-xl border border-[var(--ov-negotiation)] bg-[var(--ov-negotiation-soft)] px-3 py-2">
              <p className="text-xs font-medium text-[var(--ov-text)]">
                Fallback signals
              </p>
              <ul className="mt-1 space-y-0.5 text-xs leading-5 text-[var(--ov-text-muted)]">
                {warnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-[var(--ov-text-muted)]">
          {status.status === "loading"
            ? "Reading backend readiness\u2026"
            : "Status loads when the workspace prepares a request."}
        </p>
      )}
    </section>
  );
}
