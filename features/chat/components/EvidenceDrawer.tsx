"use client";

import { MarketEvidenceRail } from "@/features/chat/components/MarketEvidenceRail";
import type { ChatMessage } from "@/features/shared/contracts/ChatMessage";
import type {
  ContextSummaryItem,
  InspectorArtifactViewModel,
  NegotiationThreadViewModel,
  WorkflowContextFormValues,
} from "@/features/workflow/client/types";
import type { WorkflowExecutionMeta, WorkflowStatusResponse } from "@/features/workflow/types";
import { cn } from "@/lib/utils";

type ThreadLoadStatus = "idle" | "loading" | "success" | "not_found" | "error";

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;

  // All MarketEvidenceRail props
  workflowStatus: {
    status: "idle" | "loading" | "success" | "error";
    data: WorkflowStatusResponse | null;
    error: string | null;
  };
  latestExecutionMeta: Partial<WorkflowExecutionMeta> | null;
  onRefresh: () => void;
  artifacts: InspectorArtifactViewModel[];
  messages: ChatMessage[];
  threadStatus: ThreadLoadStatus;
  thread: NegotiationThreadViewModel | null;
  threadError: string | null;
  onRetryThread?: () => void;
  activeNegotiationId: string | null;
  availableNegotiationIds: string[];
  onSelectThread: (negotiationId: string) => void;
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

export function EvidenceDrawer({
  open,
  onClose,
  ...railProps
}: EvidenceDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-[440px] max-w-[92vw] flex-col border-l border-[var(--ov-border-medium)] bg-[#070b09] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-modal={open}
        role="dialog"
        aria-label="Workflow inspector"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[var(--ov-border-soft)] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[var(--ov-text-muted)] uppercase">
              Inspector
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ov-text-muted)] transition hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--ov-text)]"
            aria-label="Close inspector"
          >
            ✕
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex-1 overflow-y-auto p-5">
          <MarketEvidenceRail {...railProps} />
        </div>
      </div>
    </>
  );
}
