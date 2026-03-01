"use client";

import { marketClusters } from "@/features/landing/data/storyboard-fixtures";

const clusterStyles = {
  av_systems: "bg-[rgba(103,215,255,0.18)] text-[var(--ov-signal-strong)]",
  staffing_ops: "bg-[rgba(255,178,77,0.18)] text-[var(--ov-negotiation)]",
  logistics: "bg-[rgba(103,211,154,0.18)] text-[var(--ov-success)]",
  venue_ops: "bg-[rgba(155,233,255,0.12)] text-[var(--ov-text)]",
  backup_support: "bg-[rgba(255,209,102,0.16)] text-[var(--ov-winner)]",
} as const;

export function ClusterLegend() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      {marketClusters.map((cluster) => (
        <div
          key={cluster.id}
          className="ov-panel rounded-2xl px-4 py-3 text-sm text-[var(--ov-text-muted)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase ${clusterStyles[cluster.id]}`}
              >
                {cluster.shortLabel}
              </span>
              <p className="font-medium text-[var(--ov-text)]">{cluster.label}</p>
            </div>
            <span className="font-mono text-xs text-[var(--ov-text-muted)]">
              {cluster.count}
            </span>
          </div>
          <p className="mt-2 text-xs leading-6">{cluster.description}</p>
        </div>
      ))}
    </div>
  );
}
