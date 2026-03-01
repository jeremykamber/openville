"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { ServiceCluster } from "@/features/landing/data/storyboard-fixtures";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

// ── Types ────────────────────────────────────────────────────────────────────

type NodeState = "base" | "survivor" | "finalist" | "winner" | "dimmed";

interface MarketNodeProps {
  x: number;
  y: number;
  label: string;
  name: string;
  cluster: ServiceCluster;
  state: NodeState;
  showLabel?: boolean;
  hideLabelOnMobile?: boolean;
  subtitle?: string;
}

// ── Cluster styles — monochrome with subtle differentiation ─────────────────

const clusterNodeClasses: Record<ServiceCluster, string> = {
  plumbing: "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.12)]",
  electrical: "border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.10)]",
  hvac: "border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.09)]",
  general_contractor:
    "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)]",
  landscaping: "border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.07)]",
};

// ── Responsive node sizes — COMPACT ─────────────────────────────────────────
// Deliberately small so nodes + labels stay well clear of the status bar.

const stateClasses: Record<NodeState, string> = {
  base: "size-2 sm:size-2.5 opacity-95",
  survivor: "size-2.5 sm:size-3 shadow-[0_0_16px_rgba(255,255,255,0.12)]",
  finalist: "size-3 sm:size-3.5 shadow-[0_0_20px_rgba(255,77,77,0.18)]",
  winner:
    "size-3.5 sm:size-4 border-[rgba(255,77,77,0.35)] bg-[rgba(255,77,77,0.18)] shadow-[0_0_28px_rgba(255,77,77,0.22)]",
  dimmed: "size-1.5 sm:size-2 opacity-20 saturate-0",
};

const stateScale: Record<NodeState, number> = {
  base: 1,
  survivor: 1.1,
  finalist: 1.2,
  winner: 1.35,
  dimmed: 0.7,
};

const stateOpacity: Record<NodeState, number> = {
  base: 0.95,
  survivor: 1,
  finalist: 1,
  winner: 1,
  dimmed: 0.2,
};

// ── Component ────────────────────────────────────────────────────────────────

export const MarketNode = memo(function MarketNode({
  x,
  y,
  label,
  name,
  cluster,
  state,
  showLabel = false,
  hideLabelOnMobile = false,
  subtitle,
}: MarketNodeProps) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        transition:
          "left 0.6s cubic-bezier(0.16,1,0.3,1), top 0.6s cubic-bezier(0.16,1,0.3,1)",
        willChange: "left, top",
      }}
    >
      <motion.div
        animate={{
          scale: stateScale[state],
          opacity: stateOpacity[state],
        }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div
          className={cn(
            "rounded-full border",
            clusterNodeClasses[cluster],
            stateClasses[state],
          )}
          style={{
            transition:
              "box-shadow 0.5s ease, border-color 0.5s ease, background-color 0.5s ease, width 0.5s ease, height 0.5s ease, opacity 0.5s ease",
          }}
        />

        <AnimatePresence>
          {showLabel ? (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -3, scale: 0.94 }}
              transition={{ duration: 0.35, ease: EASE }}
              className={cn(
                "absolute left-1/2 top-full mt-1 w-max max-w-[6rem] -translate-x-1/2 rounded-md border px-1 py-0.5 text-center shadow-[0_12px_30px_rgba(0,0,0,0.4)] sm:mt-1.5 sm:max-w-[9rem] sm:rounded-lg sm:px-2 sm:py-1",
                hideLabelOnMobile && "hidden sm:block",
                state === "winner"
                  ? "border-[rgba(255,77,77,0.22)] bg-[var(--ov-surface-1)]"
                  : "border-[var(--ov-border)] bg-[var(--ov-surface-0)]",
              )}
            >
              <p className="text-[7px] font-semibold tracking-[0.1em] text-[var(--ov-text)] uppercase sm:text-[9px] sm:tracking-[0.12em]">
                {label}
              </p>
              <p className="mt-0.5 truncate text-[8px] font-medium text-[var(--ov-text)] sm:text-[10px]">
                {name}
              </p>
              {subtitle ? (
                <p className="mt-0.5 hidden text-[9px] leading-4 text-[var(--ov-text-muted)] sm:block">
                  {subtitle}
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});
