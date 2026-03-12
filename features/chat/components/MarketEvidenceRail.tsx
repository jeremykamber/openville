"use client";

import { ProtocolLog } from "@/features/chat/components/ProtocolLog";
import type { ChatMessage } from "@/features/shared/contracts/ChatMessage";
import type {
  ContextSummaryItem,
  InspectorArtifactViewModel,
  NegotiationThreadViewModel,
  WorkflowContextFormValues,
} from "@/features/workflow/client/types";
import { ContextFormPanel } from "@/features/workflow/components/ContextFormPanel";
import { NegotiationThreadInspector } from "@/features/workflow/components/NegotiationThreadInspector";
import { WorkflowStatusPanel } from "@/features/workflow/components/WorkflowStatusPanel";
import type { WorkflowExecutionMeta, WorkflowStatusResponse } from "@/features/workflow/types";

type ThreadLoadStatus = "idle" | "loading" | "success" | "not_found" | "error";

interface MarketEvidenceRailProps {
  workflowStatus: {
    status: "idle" | "loading" | "success" | "error";
    data: WorkflowStatusResponse | null;
    error: string | null;
  };
  latestExecutionMeta: Partial<WorkflowExecutionMeta> | null;
  onRefresh: () => void;

  /** Structured trace artifacts from the inspector adapter. */
  artifacts: InspectorArtifactViewModel[];
  /** Transcript messages for the protocol log. */
  messages: ChatMessage[];

  /** Negotiation thread inspector state. */
  threadStatus: ThreadLoadStatus;
  thread: NegotiationThreadViewModel | null;
  threadError: string | null;
  onRetryThread?: () => void;

  /** Thread selector for switching between negotiation threads. */
  activeNegotiationId: string | null;
  availableNegotiationIds: string[];
  onSelectThread: (negotiationId: string) => void;

  /** Context form (demoted to bottom of rail). */
  values: WorkflowContextFormValues | null;
  summary: ContextSummaryItem[];
  onFieldChange: (
    field: keyof WorkflowContextFormValues,
    value: WorkflowContextFormValues[keyof WorkflowContextFormValues],
  ) => void;
  onSubmit: () => void;
  disabled: boolean;
  hasSubmittedSearch: boolean;
}

export function MarketEvidenceRail({
  workflowStatus,
  latestExecutionMeta,
  onRefresh,
  artifacts,
  messages,
  threadStatus,
  thread,
  threadError,
  onRetryThread,
  activeNegotiationId,
  availableNegotiationIds,
  onSelectThread,
  values,
  summary,
  onFieldChange,
  onSubmit,
  disabled,
  hasSubmittedSearch,
}: MarketEvidenceRailProps) {
  const hasMultipleThreads = availableNegotiationIds.length > 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="ov-kicker">Inspector rail</p>
      </div>

      <WorkflowStatusPanel
        status={workflowStatus}
        latestExecutionMeta={latestExecutionMeta}
        onRefresh={onRefresh}
      />

      {(artifacts.length > 0 || messages.length > 0) && (
        <section className="rounded-2xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] p-4">
          <ProtocolLog messages={messages} artifacts={artifacts} />
        </section>
      )}

      {hasMultipleThreads && (
        <div className="flex flex-wrap gap-1">
          {availableNegotiationIds.map((id, index) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectThread(id)}
              className={
                id === activeNegotiationId
                  ? "rounded-lg bg-[var(--ov-surface-1)] px-2.5 py-1 text-[10px] font-semibold text-[var(--ov-text)]"
                  : "rounded-lg bg-[var(--ov-surface-deep)] px-2.5 py-1 text-[10px] font-medium text-[var(--ov-text-muted)] hover:text-[var(--ov-text)]"
              }
            >
              Thread {index + 1}
            </button>
          ))}
        </div>
      )}

      <NegotiationThreadInspector
        status={threadStatus}
        thread={thread}
        error={threadError}
        onRetry={onRetryThread}
      />

      <ContextFormPanel
        values={values}
        summary={summary}
        onFieldChange={onFieldChange}
        onSubmit={onSubmit}
        disabled={disabled}
        hasSubmittedSearch={hasSubmittedSearch}
      />
    </div>
  );
}
