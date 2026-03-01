"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  marketClusters,
  type ServiceCluster,
} from "@/features/landing/data/storyboard-fixtures";
import { EASE } from "@/lib/motion";

// ── Motion config (no blur) ─────────────────────────────────────────────────

const legendStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const legendItem = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

// ── Cluster styles — monochrome with subtle differentiation ─────────────────

const clusterStyles: Record<ServiceCluster, string> = {
  plumbing: "bg-[rgba(255,255,255,0.08)] text-[var(--ov-text)]",
  electrical: "bg-[rgba(255,255,255,0.06)] text-[var(--ov-text)]",
  hvac: "bg-[rgba(255,255,255,0.06)] text-[var(--ov-text-muted)]",
  general_contractor:
    "bg-[rgba(255,255,255,0.05)] text-[var(--ov-text-muted)]",
  landscaping: "bg-[rgba(255,255,255,0.05)] text-[var(--ov-text-muted)]",
};

// ── Component ────────────────────────────────────────────────────────────────

export function ClusterLegend() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      variants={legendStagger}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1"
    >
      {marketClusters.map((cluster) => (
        <motion.div
          key={cluster.id}
          variants={legendItem}
          className="ov-panel rounded-2xl px-4 py-3 text-sm text-[var(--ov-text-muted)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase ${clusterStyles[cluster.id]}`}
              >
                {cluster.shortLabel}
              </span>
              <p className="font-medium text-[var(--ov-text)]">
                {cluster.label}
              </p>
            </div>
            <span className="font-mono text-xs text-[var(--ov-text-muted)]">
              {cluster.count}
            </span>
          </div>
          <p className="mt-2 text-xs leading-6">{cluster.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
