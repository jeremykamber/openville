"use client";

import {
  finalists,
  marketAgents,
  marketClusters,
  top10Agents,
  type MarketCluster,
  type MarketAgent,
} from "@/features/landing/data/storyboard-fixtures";
import { cn } from "@/lib/utils";
import { ClusterLegend } from "./ClusterLegend";
import { MarketNode } from "./MarketNode";

export type MarketGraphStage =
  | "market"
  | "top10"
  | "top3"
  | "negotiation"
  | "winner";

interface StageCopy {
  eyebrow: string;
  title: string;
  body: string;
}

interface AgentMarketGraphProps {
  stage: MarketGraphStage;
  copy: StageCopy;
}

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

  if (stage === "top3" || stage === "negotiation") {
    if (finalists.some((entry) => entry.agentId === agent.id)) {
      return getFinalistPosition(agent);
    }

    if (top10Agents.some((entry) => entry.id === agent.id)) {
      return getTop10Position(agent);
    }

    return getMarketPosition(agent);
  }

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
    return isTop10 ? ("dimmed" as const) : ("dimmed" as const);
  }

  if (isWinner) {
    return "winner" as const;
  }

  return isFinalist ? ("dimmed" as const) : ("dimmed" as const);
}

function shouldShowNode(agent: MarketAgent, stage: MarketGraphStage) {
  if (stage === "market") {
    return true;
  }

  if (stage === "top10") {
    return true;
  }

  if (stage === "top3" || stage === "negotiation") {
    return top10Agents.some((entry) => entry.id === agent.id);
  }

  return finalists.some((entry) => entry.agentId === agent.id);
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

  return agent.name === "RelayCrew Systems";
}

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
            const agent = marketAgents.find((entry) => entry.id === finalist.agentId);

            return {
              from: stage === "winner" ? winnerPosition : { x: 50, y: 50 },
              to: agent ? getFinalistPosition(agent) : winnerPosition,
            };
          });

  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      {connections.map((connection, index) => (
        <line
          key={`${connection.to.x}-${connection.to.y}-${index}`}
          x1={`${connection.from.x}%`}
          y1={`${connection.from.y}%`}
          x2={`${connection.to.x}%`}
          y2={`${connection.to.y}%`}
          stroke={
            stage === "winner" && index === 0
              ? "rgba(255, 209, 102, 0.82)"
              : "rgba(103, 215, 255, 0.22)"
          }
          strokeWidth={stage === "winner" && index === 0 ? 2.5 : 1.25}
          strokeDasharray={stage === "market" ? "6 10" : undefined}
        />
      ))}
    </svg>
  );
}

export function AgentMarketGraph({ stage, copy }: AgentMarketGraphProps) {
  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.35fr]">
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="ov-kicker">{copy.eyebrow}</p>
          <h3 className="font-display text-3xl leading-tight text-[var(--ov-text)] sm:text-4xl">
            {copy.title}
          </h3>
          <p className="ov-section-copy max-w-xl">{copy.body}</p>
        </div>
        <ClusterLegend />
      </div>

      <div className="ov-panel-strong relative min-h-[34rem] overflow-hidden rounded-[2rem] p-5 sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,215,255,0.08),transparent_48%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,29,0.08),rgba(7,17,29,0.24))]" />
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(103,215,255,0.06)] blur-3xl" />
        <div className="absolute inset-0 ov-grid opacity-30" />

        <div className="relative h-full min-h-[28rem]">
          {renderConnections(stage)}
          {marketAgents.map((agent) => {
            if (!shouldShowNode(agent, stage)) {
              return null;
            }

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
                    ? agent.name === "RelayCrew Systems"
                      ? "Lowest execution risk"
                      : undefined
                    : nodeState === "finalist"
                      ? agent.specialty
                      : undefined
                }
              />
            );
          })}

          <div className="absolute bottom-0 left-0 right-0">
            <div className="rounded-[1.5rem] border border-[rgba(124,170,255,0.14)] bg-[rgba(8,15,27,0.74)] px-4 py-3 text-sm text-[var(--ov-text-muted)] shadow-[0_20px_50px_rgba(2,6,15,0.45)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[rgba(103,215,255,0.14)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-signal-strong)] uppercase">
                  {stage === "market"
                    ? "50 visible agents"
                    : stage === "top10"
                      ? "Top 10 survivors"
                      : stage === "winner"
                        ? "Winner justified"
                        : "Final negotiation"}
                </span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase",
                    stage === "winner"
                      ? "ov-chip-human"
                      : "ov-chip-success",
                  )}
                >
                  {stage === "winner"
                    ? "Explainable selection"
                    : "Deterministic narrowing"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
