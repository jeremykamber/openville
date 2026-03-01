"use client";

import {
  marketClusters,
  pastFragments,
  storyScenario,
  top10Agents,
} from "@/features/landing/data/storyboard-fixtures";

const fragmentClasses = [
  "left-2 top-3 w-44 -rotate-6",
  "right-8 top-14 w-48 rotate-4",
  "left-12 bottom-24 w-52 -rotate-4",
  "right-3 bottom-10 w-44 rotate-6",
];

const signalClasses = [
  "left-[58%] top-[18%]",
  "left-[73%] top-[26%]",
  "left-[84%] top-[42%]",
  "left-[76%] top-[61%]",
  "left-[59%] top-[72%]",
  "left-[49%] top-[50%]",
];

export function BridgePreview() {
  return (
    <div className="ov-panel-strong ov-grid relative min-h-[28rem] overflow-hidden rounded-[2rem] p-5 sm:p-7">
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(103,215,255,0.18),transparent_70%)]" />
      <div className="absolute bottom-0 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[rgba(255,178,77,0.08)] blur-3xl" />

      {pastFragments.slice(0, 4).map((fragment, index) => (
        <div
          key={fragment.id}
          className={`absolute rounded-2xl border border-dashed border-[rgba(242,191,122,0.24)] bg-[rgba(30,23,12,0.5)] px-4 py-3 text-left text-xs text-[var(--ov-human)] shadow-[0_18px_40px_rgba(6,10,18,0.32)] [animation:ov-float_8s_ease-in-out_infinite] ${fragmentClasses[index]}`}
          style={{ animationDelay: `${index * 0.6}s` }}
        >
          <p className="font-display text-[11px] tracking-[0.2em] uppercase">
            {fragment.title}
          </p>
          <p className="mt-2 leading-5 text-[rgba(242,191,122,0.82)]">
            {fragment.detail}
          </p>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 z-10 w-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-[rgba(242,191,122,0.24)] bg-[linear-gradient(180deg,rgba(20,24,31,0.96),rgba(10,15,23,0.96))] p-5 shadow-[0_28px_80px_rgba(5,10,20,0.55)]">
        <p className="ov-kicker text-[var(--ov-human)]">Northstar Launch</p>
        <p className="mt-3 font-display text-xl leading-8 text-[var(--ov-text)]">
          One request enters the market.
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--ov-text-muted)]">
          {storyScenario.request}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="ov-chip-human rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase">
            Mission District
          </span>
          <span className="ov-chip-human rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase">
            4 PM deadline
          </span>
        </div>
      </div>

      <div className="absolute inset-y-12 right-4 left-[45%] rounded-[1.75rem] border border-[rgba(124,170,255,0.12)] bg-[linear-gradient(180deg,rgba(7,17,29,0.22),rgba(7,17,29,0))]" />
      <div className="absolute left-[46%] top-1/2 h-px w-[12%] -translate-y-1/2 bg-[linear-gradient(90deg,rgba(242,191,122,0.72),rgba(103,215,255,0.72))]" />

      {signalClasses.map((className, index) => (
        <div
          key={className}
          className={`absolute h-2 w-2 rounded-full bg-[var(--ov-signal)] shadow-[0_0_24px_rgba(103,215,255,0.45)] [animation:ov-pulse_2.8s_ease-in-out_infinite] ${className}`}
          style={{ animationDelay: `${index * 0.25}s` }}
        />
      ))}

      <div className="absolute inset-y-8 right-4 flex w-[42%] flex-col justify-between">
        <div className="grid gap-2">
          {marketClusters.map((cluster, index) => (
            <div
              key={cluster.id}
              className="flex items-center justify-between rounded-2xl border border-[rgba(124,170,255,0.12)] bg-[rgba(10,17,29,0.7)] px-4 py-3 [animation:ov-float_7s_ease-in-out_infinite]"
              style={{ animationDelay: `${index * 0.35}s` }}
            >
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                  {cluster.shortLabel}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--ov-text)]">
                  {cluster.label}
                </p>
              </div>
              <p className="font-mono text-xs text-[var(--ov-signal-strong)]">
                {cluster.count}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[rgba(124,170,255,0.12)] bg-[rgba(10,17,29,0.78)] p-4">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
            top 10 contenders
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {top10Agents.slice(0, 6).map((agent) => (
              <span
                key={agent.id}
                className="rounded-full border border-[rgba(103,215,255,0.18)] bg-[rgba(103,215,255,0.12)] px-3 py-1 text-[11px] font-medium text-[var(--ov-signal-strong)]"
              >
                {agent.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
