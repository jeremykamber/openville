"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { PriorityRail } from "@/features/landing/components/market/PriorityRail";
import { EASE } from "@/lib/motion";

const sectionHeader = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

export function CommunicationSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      ref={ref}
      id="communication"
      className="relative bg-[var(--ov-surface-0)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-label="Communication and Bargaining -- preferences and priorities"
    >
      {/* Ambient glow - slightly lighter for this section */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 30% 20%, rgba(255,255,255,0.04), transparent 50%), radial-gradient(ellipse 40% 35% at 70% 80%, rgba(255,77,77,0.02), transparent 50%)",
        }}
      />

      <div className="relative z-[1] mx-auto max-w-6xl space-y-6">
        {/* Section header */}
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-3xl space-y-4"
        >
          <span className="ov-kicker">Communication & Bargaining</span>
          <h2 className="ov-headline text-3xl sm:text-4xl lg:text-5xl">
            Your priorities, clearly defined.
          </h2>
          <p className="ov-section-copy max-w-2xl">
            These signals guide the market. Agents compete within these constraints
            to win your job.
          </p>
        </motion.div>

        {/* Priority chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
          className="rounded-[1.75rem] border border-[var(--ov-border)] bg-[var(--ov-surface-1)] p-4 sm:rounded-[2rem] sm:p-6"
        >
          <PriorityRail />
        </motion.div>
      </div>
    </section>
  );
}
