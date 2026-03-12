"use client";

import { Badge } from "@/components/ui/badge";
import { MessageList } from "@/features/chat/components/MessageList";
import type { ChatMessage } from "@/features/shared/contracts/ChatMessage";
import type { InspectorArtifactViewModel } from "@/features/workflow/client/types";

interface ProtocolLogProps {
  messages: ChatMessage[];
  artifacts?: InspectorArtifactViewModel[];
}

const KIND_LABELS: Record<InspectorArtifactViewModel["kind"], string> = {
  ranking_signals: "Ranking",
  shortlist_reasoning: "Shortlist",
  negotiation_excerpt: "Negotiation",
  fallback_warning: "Warning",
  decision_comparison: "Decision",
  elimination_rationale: "Elimination",
};

function ArtifactBlock({ artifact }: { artifact: InspectorArtifactViewModel }) {
  const isWarning = artifact.kind === "fallback_warning";
  const isInferred = artifact.source === "inferred";

  return (
    <div
      className={
        isWarning
          ? "rounded-xl border border-[var(--ov-negotiation)] bg-[var(--ov-negotiation-soft)] px-3 py-2.5"
          : "rounded-xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-3 py-2.5"
      }
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
          {KIND_LABELS[artifact.kind] ?? artifact.kind}
        </span>
        <Badge
          className={
            isInferred
              ? "border-0 bg-[var(--ov-negotiation-soft)] px-1.5 py-0 text-[9px] text-[var(--ov-negotiation)]"
              : "ov-chip-success border-0 px-1.5 py-0 text-[9px]"
          }
        >
          {isInferred ? "inferred" : "real"}
        </Badge>
      </div>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-[var(--ov-text-muted)]">
        {artifact.content}
      </p>
    </div>
  );
}

export function ProtocolLog({ messages, artifacts }: ProtocolLogProps) {
  const hasArtifacts = artifacts && artifacts.length > 0;

  return (
    <section className="space-y-3">
      {hasArtifacts && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
            Trace artifacts
          </p>
          {artifacts.map((artifact, index) => (
            <ArtifactBlock
              key={`${artifact.kind}-${index}`}
              artifact={artifact}
            />
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
            Transcript
          </p>
          <MessageList messages={messages} />
        </div>
      )}
    </section>
  );
}
