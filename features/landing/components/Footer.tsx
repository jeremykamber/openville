"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { EASE, fadeUp, stagger } from "@/lib/motion";
import { LogoMark } from "@/components/ui/LogoMark";

// ── Motion config ────────────────────────────────────────────────────────────

const linkItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

// ── Component ────────────────────────────────────────────────────────────────

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#handoff" },
      { label: "The Market", href: "#funnel" },
      { label: "Negotiation", href: "#negotiation" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <footer
      ref={ref}
      className="relative border-t border-[var(--ov-border)] bg-[var(--ov-void)]"
    >
      {/* Subtle top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(153,27,27,0.2) 30%, rgba(255,77,77,0.2) 50%, rgba(153,27,27,0.2) 70%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-12 text-center md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12 md:space-y-0 md:text-left"
        >
          {/* Brand column */}
          <motion.div variants={fadeUp} className="space-y-5">
            <div className="flex items-center justify-center gap-2.5 md:justify-start">
              <LogoMark className="size-8 text-[var(--ov-text)]" />
              <span className="font-display text-base font-medium tracking-[-0.02em] text-[var(--ov-text)]">
                Openville
              </span>
            </div>
            <p className="mx-auto max-w-xs text-sm leading-7 text-[var(--ov-text-muted)] md:mx-0">
              Post one request. Let the AI market find, negotiate with, and book
              the best tradesperson for the job.
            </p>
          </motion.div>

          {/* Link columns — 3-col row on small, individual cols on md+ */}
          <motion.div
            variants={linkItem}
            className="grid grid-cols-3 gap-8 md:col-span-3 md:grid-cols-3"
          >
            {FOOTER_LINKS.map((group) => (
              <div key={group.heading}>
                <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                  {group.heading}
                </p>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-[var(--ov-text-dim)] transition-colors duration-200 hover:text-[var(--ov-text)]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--ov-border)] pt-8 sm:flex-row"
        >
          <p className="font-mono text-[11px] tracking-[0.1em] text-[var(--ov-text-dim)]">
            &copy; {new Date().getFullYear()} Openville. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
