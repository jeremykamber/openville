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
  av_systems: "border-[rgba(103,215,255,0.22)] bg-[rgba(103,215,255,0.16)]",
  staffing_ops:
    "border-[rgba(255,178,77,0.24)] bg-[rgba(255,178,77,0.16)]",
  logistics: "border-[rgba(103,211,154,0.22)] bg-[rgba(103,211,154,0.14)]",
  venue_ops: "border-[rgba(155,233,255,0.18)] bg-[rgba(155,233,255,0.12)]",
  backup_support:
    "border-[rgba(255,209,102,0.2)] bg-[rgba(255,209,102,0.14)]",
};

const stateClasses: Record<NodeState, string> = {
  base: "size-3 opacity-95",
  survivor: "size-4 shadow-[0_0_22px_rgba(103,215,255,0.35)]",
  finalist: "size-5 shadow-[0_0_28px_rgba(255,178,77,0.34)]",
  winner: "size-6 border-[rgba(255,209,102,0.4)] bg-[rgba(255,209,102,0.2)] shadow-[0_0_38px_rgba(255,209,102,0.38)]",
  dimmed: "size-2.5 opacity-20 saturate-0",
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
            "absolute left-1/2 top-full mt-2 w-max max-w-[11rem] -translate-x-1/2 rounded-xl border px-3 py-2 text-center shadow-[0_18px_40px_rgba(2,6,15,0.45)]",
            state === "winner"
              ? "border-[rgba(255,209,102,0.24)] bg-[rgba(19,32,51,0.98)]"
              : "border-[rgba(124,170,255,0.16)] bg-[rgba(9,17,29,0.92)]",
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
