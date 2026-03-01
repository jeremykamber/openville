"use client";

import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { painPoints } from "@/features/landing/data/storyboard-fixtures";
import { EASE } from "@/lib/motion";

// ── Motion config ────────────────────────────────────────────────────────────
// Fast durations, small offsets, no scale on cards, no transition-all.

const sectionHeader = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

const cardContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.06 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

const lineReveal = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

// ── Pain type icons ─────────────────────────────────────────────────────────

const painIcons: Record<string, string> = {
  search:
    "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  trust:
    "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z",
  pricing:
    "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  scheduling:
    "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  communication:
    "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
};

// Bento grid layout classes — first two cards are larger, creating visual hierarchy
const bentoClasses = [
  "sm:col-span-2 sm:row-span-2", // Endless searching — large
  "sm:col-span-1",                // Who do you trust?
  "sm:col-span-1",                // Opaque pricing
  "sm:col-span-1",                // Phone tag
  "sm:col-span-1",                // No single source
];

// ── Component ────────────────────────────────────────────────────────────────

export function OldWaySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0.25, 0.75], [1, 0]);

  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-label="Before AI -- the old way of finding tradespeople"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,255,255,0.03), transparent 60%)",
        }}
      />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-[1] mx-auto max-w-6xl"
      >
        {/* Section header — centered for impact */}
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-3xl space-y-5 text-center"
        >
          <div className="flex justify-center">
            <span className="ov-kicker">The Problem</span>
          </div>
          <h2 className="ov-headline text-3xl sm:text-5xl lg:text-[3.75rem]">
            Finding the right tradesperson is a{" "}
            <span className="text-[var(--ov-text-dim)] line-through decoration-[var(--ov-text-dim)]/30">
              nightmare
            </span>{" "}
            full-time job.
          </h2>
          <p className="ov-section-copy mx-auto">
            Twelve browser tabs, three voicemails, and the leak keeps dripping
            while you wait for callbacks. The problem was never finding a
            plumber. It was figuring out which one to trust with your home.
          </p>
        </motion.div>

        {/* Pain point bento grid */}
        <motion.div
          variants={cardContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-4 sm:grid-cols-3 sm:gap-5"
        >
          {painPoints.map((point, index) => {
            const iconPath = painIcons[point.type] ?? "";
            const isLarge = index === 0;

            return (
              <motion.article
                key={point.id}
                variants={cardItem}
                className={`group relative overflow-hidden rounded-[1.5rem] border border-[var(--ov-border)] bg-[linear-gradient(180deg,rgba(25,25,28,0.6),rgba(17,17,19,0.8))] hover:border-[var(--ov-border-strong)] hover:shadow-[0_24px_64px_rgba(0,0,0,0.4)] ${bentoClasses[index] ?? ""} ${isLarge ? "p-7 sm:p-8" : "p-5 sm:p-6"}`}
                style={{ transition: "border-color 0.2s ease, box-shadow 0.3s ease" }}
              >
                {/* Background glow on hover */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.03), transparent 50%)",
                  }}
                />

                {/* Icon + step number */}
                <div className="relative mb-4 flex items-center gap-3">
                  <div className={`flex items-center justify-center rounded-xl border border-[var(--ov-border)] bg-[rgba(255,255,255,0.03)] ${isLarge ? "size-11" : "size-9"}`}>
                    <svg
                      className={`text-[var(--ov-text-muted)] ${isLarge ? "size-5" : "size-4"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={iconPath}
                      />
                    </svg>
                  </div>
                  <span className="font-mono text-[10px] font-medium tracking-[0.14em] text-[var(--ov-text-dim)] uppercase">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3
                    className={`font-display font-medium tracking-[-0.01em] text-[var(--ov-text)] ${isLarge ? "text-2xl sm:text-3xl" : "text-lg"}`}
                  >
                    {point.title}
                  </h3>
                  <p
                    className={`mt-3 leading-7 text-[var(--ov-text-muted)] ${isLarge ? "text-base" : "text-sm"}`}
                  >
                    {point.detail}
                  </p>
                </div>

                {/* Decorative corner accent on large card */}
                {isLarge && (
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full"
                    aria-hidden="true"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255,77,77,0.04) 0%, transparent 60%)",
                    }}
                  />
                )}
              </motion.article>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
