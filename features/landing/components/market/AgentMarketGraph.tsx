"use client";

import { motion } from "motion/react";

import {
  finalists,
  marketAgents,
  marketClusters,
  top10Agents,
  type ServiceCluster,
  type MarketAgent,
} from "@/features/landing/data/storyboard-fixtures";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";
import { ClusterLegend } from "./ClusterLegend";
import { MarketNode } from "./MarketNode";

// ── Types ────────────────────────────────────────────────────────────────────

export type MarketGraphStage =
  | "market"
  | "top10"
  | "top3"
  | "negotiation"
  | "winner";

interface AgentMarketGraphProps {
  stage: MarketGraphStage;
}

// ── Stage copy — lives here so the component renders all 5 layers
// simultaneously (absolute-positioned crossfade). No mount/unmount,
// no layout shift, no container resize. ───────────────────────────────────────

const STAGE_COPY_MAP: Record<
  MarketGraphStage,
  { eyebrow: string; title: string; body: string }
> = {
  market: {
    eyebrow: "The Market",
    title: "Fifty specialist agents wake up and compete for the job.",
    body: "Plumbers, electricians, HVAC techs, general contractors, and landscapers all push for the work at once.",
  },
  top10: {
    eyebrow: "The Narrowing",
    title: "The market cuts itself down to the ten strongest fits.",
    body: "Wrong service category, weak availability, and poor trade-offs drop out before you ever see them.",
  },
  top3: {
    eyebrow: "Top Three",
    title: "Three finalists survive once reliability, scope, and pricing matter most.",
    body: "At this point the question is no longer who can respond. It is who can fix both issues in one visit, on time, and within budget.",
  },
  negotiation: {
    eyebrow: "Negotiation",
    title: "Three finalists negotiate on rate, scope, and availability.",
    body: "Your agent pressures the finalists for better terms while protecting the timeline and full job scope.",
  },
  winner: {
    eyebrow: "The Decision",
    title: "One winner is selected, and the reason is visible.",
    body: "The final choice is not magic. It is a clear trade-off between cost, scope coverage, and scheduling certainty.",
  },
};

// ── Layout positions ─────────────────────────────────────────────────────────
// All y-coordinates MUST stay within 6-62% so nodes + their labels never
// reach the status-bar zone at the bottom of the panel. The status bar
// is in normal document flow below the node area — not absolute-positioned —
// so the two zones are physically separated.

const clusterCenters: Record<ServiceCluster, { x: number; y: number }> = {
  plumbing: { x: 22, y: 16 },
  electrical: { x: 20, y: 46 },
  hvac: { x: 50, y: 58 },
  general_contractor: { x: 68, y: 22 },
  landscaping: { x: 80, y: 48 },
};

const top10Positions = [
  { x: 20, y: 16 },
  { x: 40, y: 16 },
  { x: 60, y: 16 },
  { x: 80, y: 16 },
  { x: 20, y: 38 },
  { x: 40, y: 38 },
  { x: 60, y: 38 },
  { x: 80, y: 38 },
  { x: 35, y: 58 },
  { x: 65, y: 58 },
];

const finalistPositions = [
  { x: 25, y: 44 },
  { x: 75, y: 44 },
  { x: 50, y: 16 },
];

const winnerPosition = { x: 50, y: 34 };

const WINNER_NAME = "ClearFlow Plumbing";

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupedAgents(cluster: ServiceCluster) {
  return marketAgents.filter((agent) => agent.cluster === cluster);
}

function getMarketPosition(agent: MarketAgent) {
  const clusterAgents = groupedAgents(agent.cluster);
  const center = clusterCenters[agent.cluster];
  const index = clusterAgents.findIndex((entry) => entry.id === agent.id);
  const columns = 4;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const x = center.x + (column - 1.5) * 5;
  const y = center.y + (row - 1) * 5;

  return { x, y };
}

function getTop10Position(agent: MarketAgent) {
  const index = top10Agents.findIndex((entry) => entry.id === agent.id);
  return top10Positions[index] ?? winnerPosition;
}

function getFinalistPosition(agent: MarketAgent) {
  const index = finalists.findIndex((entry) => entry.agentId === agent.id);
  return finalistPositions[index] ?? winnerPosition;
}

function getPosition(agent: MarketAgent, stage: MarketGraphStage) {
  if (stage === "market") {
    return getMarketPosition(agent);
  }

  if (stage === "top10") {
    return top10Agents.some((entry) => entry.id === agent.id)
      ? getTop10Position(agent)
      : getMarketPosition(agent);
  }

  if (stage === "top3" || stage === "negotiation") {
    if (finalists.some((entry) => entry.agentId === agent.id)) {
      return getFinalistPosition(agent);
    }

    if (top10Agents.some((entry) => entry.id === agent.id)) {
      return getTop10Position(agent);
    }

    return getMarketPosition(agent);
  }

  if (agent.name === WINNER_NAME) {
    return winnerPosition;
  }

  if (finalists.some((entry) => entry.agentId === agent.id)) {
    return getFinalistPosition(agent);
  }

  return getMarketPosition(agent);
}

function getNodeState(agent: MarketAgent, stage: MarketGraphStage) {
  const isTop10 = top10Agents.some((entry) => entry.id === agent.id);
  const isFinalist = finalists.some((entry) => entry.agentId === agent.id);
  const isWinner = agent.name === WINNER_NAME;

  if (stage === "market") {
    return "base" as const;
  }

  if (stage === "top10") {
    return isTop10 ? ("survivor" as const) : ("dimmed" as const);
  }

  if (stage === "top3" || stage === "negotiation") {
    if (isFinalist) {
      return "finalist" as const;
    }
    return "dimmed" as const;
  }

  if (isWinner) {
    return "winner" as const;
  }

  return "dimmed" as const;
}

function shouldShowLabel(agent: MarketAgent, stage: MarketGraphStage) {
  if (stage === "market") {
    return false;
  }

  if (stage === "top10") {
    return top10Agents.some((entry) => entry.id === agent.id);
  }

  if (stage === "top3" || stage === "negotiation") {
    return finalists.some((entry) => entry.agentId === agent.id);
  }

  return agent.name === WINNER_NAME;
}

// ── Connection lines — plain SVG, no motion ─────────────────────────────────

function renderConnections(stage: MarketGraphStage) {
  const connections =
    stage === "market"
      ? marketClusters.map((cluster) => ({
          from: { x: 50, y: 38 },
          to: clusterCenters[cluster.id],
        }))
      : stage === "top10"
        ? top10Agents.map((agent) => ({
            from: { x: 50, y: 38 },
            to: getTop10Position(agent),
          }))
        : finalists.map((finalist) => {
            const agent = marketAgents.find(
              (entry) => entry.id === finalist.agentId,
            );

            return {
              from: stage === "winner" ? winnerPosition : { x: 50, y: 38 },
              to: agent ? getFinalistPosition(agent) : winnerPosition,
            };
          });

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      role="presentation"
    >
      {connections.map((connection, index) => (
        <line
          key={`${stage}-${connection.to.x}-${connection.to.y}-${index}`}
          x1={`${connection.from.x}%`}
          y1={`${connection.from.y}%`}
          x2={`${connection.to.x}%`}
          y2={`${connection.to.y}%`}
          stroke={
            stage === "winner" && index === 0
              ? "rgba(255, 77, 77, 0.65)"
              : "rgba(255, 255, 255, 0.12)"
          }
          strokeWidth={stage === "winner" && index === 0 ? 2 : 1}
          strokeDasharray={stage === "market" ? "6 10" : undefined}
        />
      ))}
    </svg>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
//
// LAYOUT FIX: The battlefield panel uses an EXPLICIT fixed height at each
// breakpoint. No aspect-ratio. The interior is a flex column:
//   1. Node zone (flex-1, position:relative) — nodes live here as % coords
//   2. Status bar (fixed height, normal flow) — physically below the node zone
//
// This guarantees:
//   - The panel NEVER grows or shrinks from animation content
//   - Nodes CANNOT touch the status bar (they are in separate DOM zones)
//   - The status bar is always at the bottom

export function AgentMarketGraph({ stage }: AgentMarketGraphProps) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[0.95fr_1.35fr] xl:gap-8">
      <div className="space-y-6">
        {/* Copy — absolute-layered crossfade so the container height is
            FIXED and never changes regardless of text length per stage.
            Each stage's text is absolute-positioned inside a fixed-height
            box. Only opacity changes — no mount/unmount, no layout shift. */}
        <div className="relative h-[10rem] overflow-hidden sm:h-[12rem]">
          {(["market", "top10", "top3", "negotiation", "winner"] as const).map(
            (s) => (
              <motion.div
                key={s}
                animate={{ opacity: stage === s ? 1 : 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute inset-0 space-y-4"
                aria-hidden={stage !== s}
              >
                <p className="ov-kicker">{STAGE_COPY_MAP[s].eyebrow}</p>
                <h3 className="font-display text-3xl leading-tight text-[var(--ov-text)] sm:text-4xl">
                  {STAGE_COPY_MAP[s].title}
                </h3>
                <p className="ov-section-copy max-w-xl">
                  {STAGE_COPY_MAP[s].body}
                </p>
              </motion.div>
            ),
          )}
        </div>
        <ClusterLegend />
      </div>

      {/* ── Battlefield panel ─────────────────────────────────────────────
           EXPLICIT fixed height. Flex column. No aspect-ratio. overflow-hidden
           clips anything that escapes. The height values are chosen to give a
           roughly 4:3 feel without relying on the aspect-ratio property. */}
      <div className="ov-panel-strong flex h-[20rem] flex-col overflow-hidden rounded-[2rem] sm:h-[26rem] lg:h-[30rem]">
        {/* ── Node zone (flex-1) ── takes all remaining space above status bar */}
        <div className="relative flex-1 overflow-hidden">
          {/* Background layers */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_48%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.08),rgba(9,9,11,0.24))]" />
          <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,255,255,0.03)] blur-3xl sm:h-40 sm:w-40" />
          <div className="absolute inset-0 ov-grid opacity-30" />

          {/* Node area — fills the node zone. Percentage positions are
              relative to this container. */}
          <div className="absolute inset-0">
            {renderConnections(stage)}

            {marketAgents.map((agent) => {
              const position = getPosition(agent, stage);
              const nodeState = getNodeState(agent, stage);

              return (
                <MarketNode
                  key={agent.id}
                  x={position.x}
                  y={position.y}
                  label={agent.label}
                  name={agent.name}
                  cluster={agent.cluster}
                  state={nodeState}
                  showLabel={shouldShowLabel(agent, stage)}
                  subtitle={
                    stage === "winner"
                      ? agent.name === WINNER_NAME
                        ? "Full scope, best reliability"
                        : undefined
                      : nodeState === "finalist"
                        ? agent.specialty
                        : undefined
                  }
                />
              );
            })}
          </div>
        </div>

        {/* ── Status bar zone ── FIXED height, all children absolute.
             No flow-based sizing at all. The height is hardcoded so the
             status bar never grows or shrinks regardless of content. */}
        <div className="relative h-10 shrink-0 mx-3 mb-3 mt-1 sm:mx-5 sm:mb-4 sm:mt-2 sm:h-11">
          {(["market", "top10", "top3", "negotiation", "winner"] as const).map(
            (s) => {
              const isActive = stage === s;
              const chipLabel =
                s === "market"
                  ? "50 agents"
                  : s === "top10"
                    ? "Top 10"
                    : s === "winner"
                      ? "Winner"
                      : "Negotiation";
              const secondChipLabel =
                s === "winner"
                  ? "Explainable"
                  : "Narrowing";

              return (
                <motion.div
                  key={s}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute inset-0 ov-panel flex items-center overflow-hidden rounded-[1.25rem] px-3 sm:rounded-[1.5rem] sm:px-4"
                  aria-hidden={!isActive}
                  style={{ pointerEvents: isActive ? "auto" : "none" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="ov-chip-signal rounded-full px-2.5 py-0.5 text-[8px] font-semibold tracking-[0.18em] uppercase sm:px-3 sm:py-1 sm:text-[10px]">
                      {chipLabel}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[8px] font-semibold tracking-[0.18em] uppercase sm:px-3 sm:py-1 sm:text-[10px]",
                        s === "winner"
                          ? "ov-chip-human"
                          : "ov-chip-success",
                      )}
                    >
                      {secondChipLabel}
                    </span>
                  </div>
                </motion.div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
