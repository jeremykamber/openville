"use client";

import { useState, useEffect, useMemo } from "react";
import { TerminalStream } from "@/features/shared/components/streaming/TerminalStream";

type Phase =
  | "awakening"
  | "swarming"
  | "eliminating"
  | "settling"
  | "pitching";

interface FinalistSlot {
  name: string;
  pitchText: string;
}

interface Props {
  finalists?: FinalistSlot[];
}

interface Particle {
  id: number;
  sx: number;
  sy: number;
  angle: number;
  dist: number;
  size: number;
  wave: number;
  spawnDelay: number;
  alpha: number;
}

const AGENT_COUNT = 44;
const WAVES = 6;
const SURVIVORS = 3;

/** Deterministic pseudo-random in [0, 1). */
function sr(seed: number) {
  return (((Math.sin(seed * 127.1 + 311.7) * 43758.5453) % 1) + 1) % 1;
}

function pct(value: number, digits = 4) {
  return `${value.toFixed(digits)}%`;
}

function px(value: number, digits = 2) {
  return `${value.toFixed(digits)}px`;
}

function generateParticles(): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < AGENT_COUNT; i++) {
    const angle = (i / AGENT_COUNT) * Math.PI * 2 + sr(i + 7) * 0.42;
    const dist = 26 + sr(i + 19) * 32;
    const survive = i < SURVIVORS;
    out.push({
      id: i,
      sx: 50 + Math.cos(angle) * dist,
      sy: 50 + Math.sin(angle) * dist,
      angle,
      dist,
      size: survive ? 8 : 3 + sr(i + 31) * 4,
      wave: survive ? 0 : 1 + Math.floor(sr(i + 43) * WAVES),
      spawnDelay: sr(i + 53) * 2.4,
      alpha: survive ? 0.88 : 0.32 + sr(i + 67) * 0.42,
    });
  }
  return out;
}

const MOCK: FinalistSlot[] = [
  {
    name: "Agent Alpha",
    pitchText:
      "Proposed $2,140 \u2014 Full crew available tomorrow morning. Specializes in structural repair and weatherproofing with a 15-year track record.",
  },
  {
    name: "Agent Kappa",
    pitchText:
      "Proposed $1,890 \u2014 Licensed and bonded, rapid deployment. Offers sustainable materials and energy-efficient solutions at competitive rates.",
  },
  {
    name: "Agent Sigma",
    pitchText:
      "Proposed $2,350 \u2014 Premium-grade materials included. Guarantees completion within 48 hours with a comprehensive warranty.",
  },
];

const FINAL_POS = [
  { x: 20, y: 40 },
  { x: 50, y: 36 },
  { x: 80, y: 40 },
];

const BUBBLE = [
  { left: "2%", top: "17%", width: "30%" },
  { left: "35%", top: "15%", width: "30%" },
  { left: "68%", top: "17%", width: "30%" },
];

const KF = `
@keyframes swarm-orb-breathe {
  0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.85; }
  50%      { transform: translate(-50%,-50%) scale(1.07); opacity: 1; }
}
@keyframes swarm-orb-halo {
  0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.25; }
  50%      { transform: translate(-50%,-50%) scale(1.14); opacity: 0.52; }
}
@keyframes swarm-orb-rotate {
  from { transform: translate(-50%,-50%) rotate(0deg); }
  to   { transform: translate(-50%,-50%) rotate(360deg); }
}
@keyframes swarm-orb-ring {
  0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.3; }
  50%      { transform: translate(-50%,-50%) scale(1.1); opacity: 0.5; }
}
@keyframes swarm-trail-flow {
  to { stroke-dashoffset: -24; }
}
@keyframes swarm-bubble-bloom {
  from { opacity: 0; transform: translateY(16px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes swarm-particle-twinkle {
  0%, 100% { opacity: 0.45; }
  50%      { opacity: 1; }
}
`;

export function OpenvilleHeroSwarmField({ finalists }: Props = {}) {
  const [phase, setPhase] = useState<Phase>("awakening");
  const [wave, setWave] = useState(0);
  const [bubbles, setBubbles] = useState(0);
  const [cycle, setCycle] = useState(0);

  const particles = useMemo(generateParticles, []);
  const data = finalists ?? MOCK;

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    let t = 0;

    t += 1400;
    ids.push(setTimeout(() => setPhase("swarming"), t));

    t += 3800;
    ids.push(setTimeout(() => setPhase("eliminating"), t));

    for (let w = 1; w <= WAVES; w++) {
      ids.push(setTimeout(() => setWave(w), t + w * 950));
    }

    t += WAVES * 950 + 1400;
    ids.push(setTimeout(() => setPhase("settling"), t));

    t += 2800;
    ids.push(setTimeout(() => setPhase("pitching"), t));

    ids.push(setTimeout(() => setBubbles(1), t + 350));
    ids.push(setTimeout(() => setBubbles(2), t + 1100));
    ids.push(setTimeout(() => setBubbles(3), t + 1900));

    t += 14000;
    ids.push(
      setTimeout(() => {
        setPhase("awakening");
        setWave(0);
        setBubbles(0);
        setCycle((c) => c + 1);
      }, t),
    );

    return () => ids.forEach(clearTimeout);
  }, [cycle]);

  const isFinal = phase === "settling" || phase === "pitching";
  const orbTop = isFinal ? 80 : 50;

  const alive = useMemo(
    () => particles.filter((p) => p.wave === 0 || p.wave > wave).length,
    [wave, particles],
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-[460px] overflow-hidden sm:h-[560px] lg:h-[680px]"
    >
      <style>{KF}</style>

      <div className="absolute inset-[2%] rounded-[2.8rem] border border-[#f97316]/6 bg-[linear-gradient(180deg,rgba(17,10,7,0.48),rgba(7,4,3,0.12)_38%,transparent)]" />
      <div className="absolute inset-[2%] rounded-[2.8rem] bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.09),transparent_32%),radial-gradient(circle_at_22%_28%,rgba(245,217,191,0.05),transparent_20%),radial-gradient(circle_at_78%_32%,rgba(249,115,22,0.06),transparent_20%)]" />

      {/* Swarm trail SVG */}
      <svg
        className="absolute inset-0 h-full w-full"
        style={{
          opacity: isFinal ? 0 : 0.32,
          transition: "opacity 2s ease",
        }}
      >
        {particles.map((p) => {
          const dead = p.wave > 0 && wave >= p.wave;
          return (
            <line
              key={`st-${p.id}`}
              x1={pct(p.sx)}
              y1={pct(p.sy)}
              x2="50%"
              y2="50%"
              stroke="rgba(249,115,22,0.11)"
              strokeWidth="0.5"
              strokeDasharray="3 7"
              style={{
                opacity: phase === "awakening" ? 0 : dead ? 0 : 0.5,
                transition: `opacity ${dead ? "1.6s" : "1.8s"} ease`,
                animation:
                  !dead && phase !== "awakening"
                    ? "swarm-trail-flow 4.5s linear infinite"
                    : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Finalist trail SVG */}
      <svg
        className="absolute inset-0 h-full w-full"
        style={{
          opacity: phase === "pitching" ? 0.4 : 0,
          transition: "opacity 2s ease 0.4s",
        }}
      >
        {FINAL_POS.map((pos, i) => (
          <line
            key={`ft-${i}`}
            x1={pct(pos.x)}
            y1={pct(pos.y)}
            x2="50%"
            y2="80%"
            stroke="rgba(249,168,68,0.16)"
            strokeWidth="0.8"
            strokeDasharray="4 8"
            style={{ animation: "swarm-trail-flow 3.5s linear infinite" }}
          />
        ))}
      </svg>

      {/* Swarm agents */}
      {particles.map((p) => {
        const dead = p.wave > 0 && wave >= p.wave;
        const survivor = p.wave === 0;
        const idx = survivor ? p.id : -1;
        const atFinal = isFinal && survivor;
        const fp = atFinal ? FINAL_POS[idx] : null;
        const visible = phase !== "awakening" && !dead;

        return (
          <div
            key={`ag-${p.id}`}
            className="absolute rounded-full"
            style={{
              left: pct(fp ? fp.x : p.sx),
              top: pct(fp ? fp.y : p.sy),
              width: atFinal ? px(13) : px(p.size),
              height: atFinal ? px(13) : px(p.size),
              background: survivor
                ? "radial-gradient(circle,rgba(255,200,140,0.95),rgba(249,115,22,0.35) 65%,transparent)"
                : "radial-gradient(circle,rgba(249,115,22,0.9),rgba(185,65,22,0.22) 65%,transparent)",
              boxShadow: survivor
                ? "0 0 16px rgba(249,115,22,0.5)"
                : "0 0 5px rgba(249,115,22,0.1)",
              opacity: visible ? p.alpha : 0,
              transform: `translate(-50%,-50%) scale(${visible ? 1 : phase === "awakening" ? 0 : 0.12})`,
              filter: dead ? "blur(4px)" : "none",
              transitionProperty:
                "opacity, transform, left, top, width, height, filter, box-shadow",
              transitionDuration: [
                dead ? "1.8s" : "0.8s",
                dead ? "1.8s" : "0.8s",
                "2.4s",
                "2.4s",
                "1.6s",
                "1.6s",
                "1.6s",
                "1.6s",
              ].join(","),
              transitionTimingFunction:
                "ease, ease, cubic-bezier(.25,.1,.25,1), cubic-bezier(.25,.1,.25,1), ease, ease, ease, ease",
              transitionDelay:
                phase === "swarming"
                  ? `${p.spawnDelay}s`
                  : dead
                    ? `${sr(p.id + 88) * 0.5}s`
                    : "0s",
            }}
          />
        );
      })}

      {/* Job Agent Orb */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: pct(orbTop),
          transition:
            "top 2.8s cubic-bezier(.25,.1,.25,1), left 2.8s cubic-bezier(.25,.1,.25,1)",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: px(170),
            height: px(170),
            left: "50%",
            top: "50%",
            background:
              "radial-gradient(circle,transparent 22%,rgba(249,115,22,0.055) 48%,transparent 70%)",
            animation: "swarm-orb-halo 5.2s ease-in-out infinite",
            opacity: phase === "awakening" ? 0 : 0.75,
            transition: "opacity 1.4s ease",
            transform: "translate(-50%,-50%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: px(100),
            height: px(100),
            left: "50%",
            top: "50%",
            background:
              "radial-gradient(circle,rgba(248,168,68,0.17),rgba(249,115,22,0.07) 55%,transparent 72%)",
            animation: "swarm-orb-breathe 3.4s ease-in-out infinite",
            opacity: phase === "awakening" ? 0 : 0.88,
            transition: "opacity 1.1s ease 0.15s",
            transform: "translate(-50%,-50%)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: px(60),
            height: px(60),
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            animation: "swarm-orb-rotate 16s linear infinite",
            opacity: phase === "awakening" ? 0 : 0.6,
            transition: "opacity 1.2s ease 0.3s",
          }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r = 40;
            return (
              <div
                key={`rp-${i}`}
                className="absolute rounded-full"
                style={{
                  width: px(i % 3 === 0 ? 3 : 2),
                  height: px(i % 3 === 0 ? 3 : 2),
                  left: pct(50 + Math.cos(a) * r),
                  top: pct(50 + Math.sin(a) * r),
                  background: "rgba(255,210,160,0.82)",
                  boxShadow: "0 0 4px rgba(248,180,100,0.5)",
                  animation: `swarm-particle-twinkle ${1.8 + sr(i + 77) * 1.4}s ease-in-out infinite`,
                  transform: "translate(-50%,-50%)",
                }}
              />
            );
          })}
        </div>
        <div
          className="absolute rounded-full"
          style={{
            width: px(38),
            height: px(38),
            left: "50%",
            top: "50%",
            border: "1px solid rgba(249,168,68,0.14)",
            background: "transparent",
            animation: "swarm-orb-ring 2.6s ease-in-out infinite",
            opacity: phase === "awakening" ? 0 : 0.45,
            transition: "opacity 1s ease 0.25s",
            transform: "translate(-50%,-50%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: px(24),
            height: px(24),
            left: "50%",
            top: "50%",
            background:
              "radial-gradient(circle,rgba(255,228,188,0.95),rgba(249,168,68,0.62) 48%,rgba(249,115,22,0.22) 80%,transparent)",
            boxShadow:
              "0 0 30px rgba(249,168,68,0.48), 0 0 60px rgba(249,115,22,0.16)",
            animation: "swarm-orb-breathe 2.8s ease-in-out infinite",
            opacity: phase === "awakening" ? 0 : 1,
            transition: "opacity 0.8s ease",
            transform: "translate(-50%,-50%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: px(7),
            height: px(7),
            left: "50%",
            top: "50%",
            background: "rgba(255,242,222,0.95)",
            boxShadow: "0 0 8px rgba(255,220,180,0.65)",
            opacity: phase === "awakening" ? 0 : 0.88,
            transition: "opacity 0.6s ease 0.08s",
            transform: "translate(-50%,-50%)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.34em] sm:text-[9px]"
          style={{
            top: "calc(50% + 55px)",
            color: "rgba(249,168,68,0.38)",
            opacity: phase === "awakening" ? 0 : 0.6,
            transition: "opacity 1.5s ease 0.5s",
          }}
        >
          job agent
        </div>
      </div>

      {/* Thought bubbles (sm+) */}
      {data.slice(0, bubbles).map((f, i) => (
        <div
          key={`bub-${i}-${cycle}`}
          className="absolute hidden sm:block"
          style={{
            left: BUBBLE[i].left,
            top: BUBBLE[i].top,
            width: BUBBLE[i].width,
            animation: "swarm-bubble-bloom 0.9s ease both",
          }}
        >
          <div
            className="relative overflow-hidden rounded-2xl border border-[#f97316]/10 px-4 py-3"
            style={{
              background:
                "linear-gradient(145deg,rgba(12,10,8,0.92),rgba(18,14,10,0.86))",
              boxShadow:
                "0 0 28px rgba(249,115,22,0.04), inset 0 1px 0 rgba(255,255,255,0.02)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="absolute rounded-[50%] border border-[#f97316]/8"
              style={{
                width: "40%",
                height: px(20),
                top: -9,
                left: "8%",
                background: "rgba(12,10,8,0.92)",
                borderBottom: "none",
              }}
            />
            <div
              className="absolute rounded-[50%] border border-[#f97316]/8"
              style={{
                width: "32%",
                height: px(22),
                top: -11,
                left: "38%",
                background: "rgba(12,10,8,0.92)",
                borderBottom: "none",
              }}
            />
            <div
              className="absolute rounded-[50%] border border-[#f97316]/8"
              style={{
                width: "28%",
                height: px(17),
                top: -7,
                right: "8%",
                background: "rgba(12,10,8,0.92)",
                borderBottom: "none",
              }}
            />
            <div className="relative z-10 mb-1.5 font-mono text-[8px] uppercase tracking-[0.24em] text-[#f97316]/48 sm:text-[9px]">
              {f.name}
            </div>
            <TerminalStream
              text={f.pitchText}
              speed={22}
              className="relative z-10 font-mono text-[9px] leading-[1.65] text-stone-400/85 sm:text-[10px]"
            />
          </div>
          <div className="relative ml-[36%]">
            <div
              className="ml-1 mt-2 rounded-full border border-[#f97316]/10"
              style={{
                width: px(10),
                height: px(10),
                background: "rgba(12,10,8,0.65)",
                boxShadow: "0 0 6px rgba(249,115,22,0.03)",
              }}
            />
            <div
              className="ml-3 mt-1 rounded-full border border-[#f97316]/7"
              style={{
                width: px(6),
                height: px(6),
                background: "rgba(12,10,8,0.45)",
              }}
            />
            <div
              className="ml-4 mt-0.5 rounded-full"
              style={{
                width: px(3),
                height: px(3),
                background: "rgba(249,115,22,0.12)",
              }}
            />
          </div>
        </div>
      ))}

      {/* Mobile thought bubble */}
      {phase === "pitching" && (
        <div
          className="absolute inset-x-[3%] top-[18%] sm:hidden"
          style={{ animation: "swarm-bubble-bloom 0.9s ease both" }}
        >
          <div
            className="rounded-xl border border-[#f97316]/10 px-3 py-3.5"
            style={{
              background: "rgba(12,10,8,0.9)",
              boxShadow: "0 0 20px rgba(249,115,22,0.035)",
            }}
          >
            <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.22em] text-[#f97316]/45">
              top 3 finalists pitching
            </div>
            <TerminalStream
              key={`mob-${cycle}`}
              text={data[0]?.pitchText ?? ""}
              speed={20}
              className="font-mono text-[9px] leading-[1.6] text-stone-400/80"
            />
          </div>
          <div className="ml-[30%] mt-1.5">
            <div
              className="ml-1 rounded-full border border-[#f97316]/8"
              style={{
                width: px(8),
                height: px(8),
                background: "rgba(12,10,8,0.55)",
              }}
            />
            <div
              className="ml-2.5 mt-0.5 rounded-full"
              style={{
                width: px(4),
                height: px(4),
                background: "rgba(249,115,22,0.1)",
              }}
            />
          </div>
        </div>
      )}

      {/* Phase labels */}
      <div className="absolute inset-x-[4%] top-[5%] z-20 flex items-start justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.34em] sm:text-[10px]">
        <div className="flex min-h-[2.5rem] flex-col justify-start gap-1 text-stone-500/55">
          <div
            style={{
              opacity:
                phase === "swarming" || phase === "eliminating" ? 0.8 : 0,
              transition: "opacity 1.5s ease",
            }}
          >
            {phase === "eliminating"
              ? `filtering \u00b7 wave ${wave}/${WAVES}`
              : "agents swarming"}
          </div>
          <div
            style={{
              opacity: phase === "settling" ? 0.8 : 0,
              transition: "opacity 1.2s ease",
            }}
            className="text-[#f97316]/40"
          >
            top 3 selected
          </div>
          <div
            style={{
              opacity: phase === "pitching" ? 0.85 : 0,
              transition: "opacity 1.5s ease",
            }}
            className="text-[#f97316]/40"
          >
            top 3 &middot; negotiation pitches
          </div>
        </div>

        <div
          className="pt-0.5 text-stone-500/45"
          style={{
            opacity: phase === "eliminating" ? 0.7 : 0,
            transition: "opacity 1.5s ease",
          }}
        >
          {alive} remaining
        </div>
      </div>

      {/* Footer stats */}
      <div
        className="absolute bottom-[4%] left-[4%] flex gap-3 font-mono text-[8px] uppercase tracking-[0.22em] text-stone-600 sm:gap-4 sm:text-[9px]"
        style={{
          opacity: phase !== "awakening" ? 0.55 : 0,
          transition: "opacity 1.4s ease",
        }}
      >
        <span>1 request</span>
        <span>1 job agent</span>
      </div>

      <div
        className="absolute bottom-[4%] right-[4%] flex gap-3 font-mono text-[8px] uppercase tracking-[0.22em] text-stone-600 sm:gap-4 sm:text-[9px]"
        style={{
          opacity: phase !== "awakening" ? 0.55 : 0,
          transition: "opacity 1.4s ease",
        }}
      >
        <span>
          {isFinal ? "3 finalists" : `${AGENT_COUNT} swarm agents`}
        </span>
      </div>
    </div>
  );
}
