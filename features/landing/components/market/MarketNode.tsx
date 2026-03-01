"use client";

import type { MarketCluster } from "@/features/landing/data/storyboard-fixtures";
import { cn } from "@/lib/utils";

type NodeState = "base" | "survivor" | "finalist" | "winner" | "dimmed";

interface MarketNodeProps {
  x: number;
  y: number;
  label: string;
  name: string;
  cluster: MarketCluster;
  state: NodeState;
  showLabel?: boolean;
  subtitle?: string;
}

const clusterNodeClasses: Record<MarketCluster, string> = {
  av_systems: "border-[var(--ov-cluster-av-border)] bg-[var(--ov-cluster-av-bg)]",
  staffing_ops:
    "border-[var(--ov-cluster-staffing-border)] bg-[var(--ov-cluster-staffing-bg)]",
  logistics: "border-[var(--ov-cluster-logistics-border)] bg-[var(--ov-cluster-logistics-bg)]",
  venue_ops: "border-[var(--ov-cluster-venue-border)] bg-[var(--ov-cluster-venue-bg)]",
  backup_support:
    "border-[var(--ov-cluster-backup-border)] bg-[var(--ov-cluster-backup-bg)]",
};

const stateClasses: Record<NodeState, string> = {
  base: "size-3 [animation:ov-pulse_3s_ease-in-out_infinite]",
  survivor: "size-4 shadow-[0_0_22px_var(--ov-glow-signal)]",
  finalist: "size-5 shadow-[0_0_28px_var(--ov-glow-negotiation)]",
  winner:
    "size-6 border-[var(--ov-glow-winner)] bg-[var(--ov-winner-soft)] shadow-[0_0_38px_var(--ov-glow-winner)] [animation:ov-pulse_2s_ease-in-out_infinite]",
  dimmed: "size-1 opacity-15 saturate-0",
};

export function MarketNode({
  x,
  y,
  label,
  name,
  cluster,
  state,
  showLabel = false,
  subtitle,
}: MarketNodeProps) {
  return (
    <div
      className="absolute transition-all duration-700 ease-out"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className={cn(
          "rounded-full border backdrop-blur-sm",
          clusterNodeClasses[cluster],
          stateClasses[state],
        )}
      />
      {showLabel ? (
        <div
          className={cn(
            "absolute left-1/2 top-full mt-2 w-max max-w-[11rem] -translate-x-1/2 rounded-xl border px-3 py-2 text-center shadow-[0_18px_40px_var(--ov-shadow-strong)]",
            state === "winner"
              ? "border-[var(--ov-winner-border)] bg-[var(--ov-surface-1)]"
              : "border-[var(--ov-border-medium)] bg-[var(--ov-surface-0)]",
          )}
        >
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--ov-text)] uppercase">
            {label}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--ov-text)]">{name}</p>
          {subtitle ? (
            <p className="mt-1 text-[11px] leading-5 text-[var(--ov-text-muted)]">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
