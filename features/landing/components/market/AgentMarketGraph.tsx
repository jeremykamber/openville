"use client";

import type React from "react";

import {
  finalists,
  marketAgents,
  marketClusters,
  top10Agents,
  type MarketCluster,
  type MarketAgent,
} from "@/features/landing/data/storyboard-fixtures";
import type { EliminationCandidateViewModel } from "@/features/workflow/client/types";
import { cn } from "@/lib/utils";
import { MarketNode } from "./MarketNode";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type MarketGraphStage =
  | "market"
  | "top10"
  | "top3"
  | "top3-pitch"
  | "negotiation"
  | "winner";

interface StageCopy {
  eyebrow: string;
  title: string;
}

interface AgentMarketGraphProps {
  stage: MarketGraphStage;
  copy: StageCopy;
  layout?: "fullscreen" | "embedded" | "fullCanvas";
  className?: string;
  /** Real elimination data from workflow — overlays inferred reasons on dimmed top-10 nodes. */
  eliminationData?: EliminationCandidateViewModel[];
}

/* ------------------------------------------------------------------ */
/*  Spatial layout — cluster centers & pre-computed positions           */
/* ------------------------------------------------------------------ */

const clusterCenters: Record<MarketCluster, { x: number; y: number }> = {
  av_systems: { x: 22, y: 26 },
  staffing_ops: { x: 20, y: 67 },
  logistics: { x: 49, y: 76 },
  venue_ops: { x: 66, y: 35 },
  backup_support: { x: 81, y: 64 },
};

const top10Positions = [
  { x: 22, y: 30 },
  { x: 42, y: 30 },
  { x: 62, y: 30 },
  { x: 82, y: 30 },
  { x: 22, y: 52 },
  { x: 42, y: 52 },
  { x: 62, y: 52 },
  { x: 82, y: 52 },
  { x: 36, y: 74 },
  { x: 68, y: 74 },
];

const finalistPositions = [
  { x: 30, y: 60 },
  { x: 70, y: 60 },
  { x: 50, y: 28 },
];

const winnerPosition = { x: 50, y: 46 };

/* ------------------------------------------------------------------ */
/*  Position + state helpers                                           */
/* ------------------------------------------------------------------ */

function groupedAgents(cluster: MarketCluster) {
  return marketAgents.filter((agent) => agent.cluster === cluster);
}

function getMarketPosition(agent: MarketAgent) {
  const clusterAgents = groupedAgents(agent.cluster);
  const center = clusterCenters[agent.cluster];
  const index = clusterAgents.findIndex((entry) => entry.id === agent.id);
  const columns = 4;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const x = center.x + (column - 1.5) * 6.5;
  const y = center.y + (row - 1) * 7.5;
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

  if (stage === "top3" || stage === "top3-pitch" || stage === "negotiation") {
    if (finalists.some((entry) => entry.agentId === agent.id)) {
      return getFinalistPosition(agent);
    }
    if (top10Agents.some((entry) => entry.id === agent.id)) {
      return getTop10Position(agent);
    }
    return getMarketPosition(agent);
  }

  // winner stage
  if (agent.name === "RelayCrew Systems") {
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
  const isWinner = agent.name === "RelayCrew Systems";

  if (stage === "market") return "base" as const;

  if (stage === "top10") {
    return isTop10 ? ("survivor" as const) : ("dimmed" as const);
  }

  if (stage === "top3" || stage === "top3-pitch" || stage === "negotiation") {
    return isFinalist ? ("finalist" as const) : ("dimmed" as const);
  }

  // winner stage
  return isWinner ? ("winner" as const) : ("dimmed" as const);
}

function shouldShowNode(agent: MarketAgent, stage: MarketGraphStage) {
  if (stage === "market" || stage === "top10") return true;

  if (stage === "top3" || stage === "top3-pitch" || stage === "negotiation") {
    return top10Agents.some((entry) => entry.id === agent.id);
  }

  return finalists.some((entry) => entry.agentId === agent.id);
}

function shouldShowLabel(agent: MarketAgent, stage: MarketGraphStage) {
  if (stage === "market") return false;

  if (stage === "top10") {
    return top10Agents.some((entry) => entry.id === agent.id);
  }

  if (stage === "top3" || stage === "top3-pitch" || stage === "negotiation") {
    return finalists.some((entry) => entry.agentId === agent.id);
  }

  return agent.name === "RelayCrew Systems";
}

/* ------------------------------------------------------------------ */
/*  Elimination label lookup                                           */
/* ------------------------------------------------------------------ */

function getEliminationSubtitle(
  agent: MarketAgent,
  stage: MarketGraphStage,
  eliminationData?: EliminationCandidateViewModel[],
): string | undefined {
  // Only show elimination labels on dimmed top-10 nodes during top3+ stages
  if (stage !== "top3" && stage !== "top3-pitch" && stage !== "negotiation") {
    return undefined;
  }

  const isFinalist = finalists.some((entry) => entry.agentId === agent.id);
  if (isFinalist) return undefined;

  const isTop10 = top10Agents.some((entry) => entry.id === agent.id);
  if (!isTop10) return undefined;

  // Try real data first, fall back to fixture
  if (eliminationData) {
    const match = eliminationData.find((vm) => vm.name === agent.name);
    if (match) return match.eliminationReason;
  }

  return agent.eliminationReason ?? undefined;
}

/* ------------------------------------------------------------------ */
/*  SVG connection lines with draw-in animation                        */
/* ------------------------------------------------------------------ */

function renderConnections(stage: MarketGraphStage) {
  const connections =
    stage === "market"
      ? marketClusters.map((cluster) => ({
          from: { x: 50, y: 50 },
          to: clusterCenters[cluster.id],
        }))
      : stage === "top10"
        ? top10Agents.map((agent) => ({
            from: { x: 50, y: 50 },
            to: getTop10Position(agent),
          }))
        : finalists.map((finalist) => {
            const agent = marketAgents.find(
              (entry) => entry.id === finalist.agentId,
            );
            return {
              from: stage === "winner" ? winnerPosition : { x: 50, y: 50 },
              to: agent ? getFinalistPosition(agent) : winnerPosition,
            };
          });

  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <style>{`
          @keyframes ov-draw-line {
            from { stroke-dashoffset: var(--line-length); opacity: 0; }
            to   { stroke-dashoffset: 0; opacity: 1; }
          }
          .ov-line-draw {
            animation: ov-draw-line 0.9s ease-out forwards;
          }
        `}</style>
      </defs>
      {connections.map((connection, index) => {
        const isWinnerLine = stage === "winner" && index === 0;
        const dx = connection.to.x - connection.from.x;
        const dy = connection.to.y - connection.from.y;
        const length = Math.sqrt(dx * dx + dy * dy) * 8;

        return (
          <line
            key={`${stage}-${connection.to.x}-${connection.to.y}-${index}`}
            x1={`${connection.from.x}%`}
            y1={`${connection.from.y}%`}
            x2={`${connection.to.x}%`}
            y2={`${connection.to.y}%`}
            strokeWidth={isWinnerLine ? 2.5 : 1}
            strokeDasharray={stage === "market" ? "6 10" : `${length}`}
            strokeDashoffset={stage === "market" ? undefined : length}
            className={stage !== "market" ? "ov-line-draw" : undefined}
            style={{
              stroke: isWinnerLine ? "var(--ov-stroke-winner)" : "var(--ov-stroke-default)",
              animationDelay: `${index * 80}ms`,
              "--line-length": `${length}`,
            } as React.CSSProperties}
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Stage badge text                                                    */
/* ------------------------------------------------------------------ */

const stageBadge: Record<MarketGraphStage, string> = {
  market: "50 \u2192 MARKET OPEN",
  top10: "10 \u2192 SURVIVORS",
  top3: "3 \u2192 FINALISTS",
  "top3-pitch": "3 \u2192 PITCH LIVE",
  negotiation: "3 \u2192 NEGOTIATION LIVE",
  winner: "1 \u2192 WINNER SELECTED",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AgentMarketGraph({
  stage,
  copy,
  layout = "fullscreen",
  className,
  eliminationData,
}: AgentMarketGraphProps) {
  const isFullscreen = layout === "fullscreen";
  const isFullCanvas = layout === "fullCanvas";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        isFullscreen
          ? "h-screen w-screen"
          : isFullCanvas
            ? "h-full w-full rounded-[2rem] bg-[#070b09]"
            : "h-[340px] w-full rounded-[2rem] border border-[var(--ov-border-medium)] bg-[rgba(10,13,11,0.72)] shadow-[0_30px_80px_var(--ov-shadow-strong)] sm:h-[420px]",
        className,
      )}
      style={
        isFullscreen
          ? {
              marginLeft: "calc(-50vw + 50%)",
              marginRight: "calc(-50vw + 50%)",
            }
          : undefined
      }
    >
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_40%,var(--ov-signal-soft),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,var(--ov-negotiation-soft),transparent_45%)]" />
      <div className="absolute inset-0 ov-grid opacity-[0.12]" />

      {/* Center glow — reacts to stage */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-1000 ease-out",
          stage === "winner"
            ? "h-64 w-64 bg-[var(--ov-winner-soft)]"
            : stage === "negotiation" || stage === "top3-pitch"
              ? "h-48 w-48 bg-[var(--ov-negotiation-soft)]"
              : "h-40 w-40 bg-[var(--ov-signal-soft)]",
        )}
      />

      {/* Graph field */}
      <div className="absolute inset-0">
        {renderConnections(stage)}
        {marketAgents.map((agent) => {
          if (!shouldShowNode(agent, stage)) return null;

          const position = getPosition(agent, stage);
          const nodeState = getNodeState(agent, stage);
          const elimSubtitle = getEliminationSubtitle(agent, stage, eliminationData);

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
                  ? agent.name === "RelayCrew Systems"
                    ? "Lowest execution risk"
                    : undefined
                  : nodeState === "finalist"
                    ? agent.specialty
                    : nodeState === "dimmed" && elimSubtitle
                      ? elimSubtitle
                      : undefined
              }
            />
          );
        })}
      </div>

      {/* Bottom-left: stage copy overlay */}
      <div
        className={cn(
          "absolute z-10 max-w-sm",
          isFullscreen
            ? "bottom-8 left-6 sm:bottom-12 sm:left-10"
            : "bottom-6 left-5 sm:bottom-8 sm:left-8",
        )}
      >
        <p className="ov-kicker">{copy.eyebrow}</p>
        <h3
          className={cn(
            "mt-2 font-display leading-tight text-[var(--ov-text)]",
            isFullscreen ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-3xl",
          )}
        >
          {copy.title}
        </h3>
      </div>

      {/* Bottom-right: stage badge */}
      <div
        className={cn(
          "absolute z-10",
          isFullscreen
            ? "bottom-8 right-6 sm:bottom-12 sm:right-10"
            : "bottom-6 right-5 sm:bottom-8 sm:right-8",
        )}
      >
        <span
          className={cn(
            "rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-500",
            stage === "winner"
              ? "border-[var(--ov-winner-border)] bg-[var(--ov-winner-soft)] text-[var(--ov-winner)]"
              : "border-[var(--ov-signal-border)] bg-[var(--ov-signal-soft)] text-[var(--ov-signal-strong)]",
          )}
        >
          {stageBadge[stage]}
        </span>
      </div>
    </div>
  );
}
