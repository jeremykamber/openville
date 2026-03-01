"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";

// ── Types ────────────────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Problem", href: "#problem" },
  { label: "How it works", href: "#handoff" },
  { label: "The Market", href: "#funnel" },
  { label: "Negotiation", href: "#negotiation" },
];

// ── Motion config ────────────────────────────────────────────────────────────

const headerEntrance = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay: 0.2 },
  },
};

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    transition: { duration: 0.3, ease: EASE },
  },
  open: {
    opacity: 1,
    transition: { duration: 0.4, ease: EASE },
  },
};

const mobileLinkStagger = {
  closed: {},
  open: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const mobileLinkItem = {
  closed: { opacity: 0, x: -24 },
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

// ── Component ────────────────────────────────────────────────────────────────

interface HeaderProps {
  onCtaClick?: () => void;
}

export function Header({ onCtaClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Scroll-aware: transparent at top, solid on scroll, hide on scroll down, show on scroll up
  useEffect(() => {
    function handleScroll() {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        setScrolled(currentY > 40);

        // Only hide/show after passing the hero fold
        if (currentY > 300) {
          setHidden(currentY > lastScrollY.current && currentY - lastScrollY.current > 5);
        } else {
          setHidden(false);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = useCallback(
    (href: string) => {
      setMobileOpen(false);
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [],
  );

  return (
    <>
      <motion.header
        variants={headerEntrance}
        initial="hidden"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className={`transition-colors duration-500 ${
            scrolled
              ? "border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.82)] backdrop-blur-2xl"
              : "border-b border-transparent bg-transparent"
          }`}
        >
          <nav
            className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[4.5rem] sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group flex items-center gap-2.5"
            >
              <div className="relative flex size-8 items-center justify-center">
                {/* Logo mark — stylized "O" */}
                <div className="absolute inset-0 rounded-lg border border-[var(--ov-border-strong)] bg-[var(--ov-surface-1)] transition-all duration-300 group-hover:border-[rgba(200,169,126,0.3)] group-hover:shadow-[0_0_20px_rgba(200,169,126,0.08)]" />
                <span className="relative font-display text-sm font-semibold text-[var(--ov-text)]">
                  O
                </span>
              </div>
              <span className="font-display text-base font-medium tracking-[-0.02em] text-[var(--ov-text)]">
                Openville
              </span>
            </a>

            {/* Desktop nav links */}
            <div className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-[var(--ov-text-muted)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--ov-text)]"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCtaClick}
                className="hidden rounded-xl border border-[rgba(200,169,126,0.2)] bg-[rgba(200,169,126,0.06)] px-4 py-2 text-[13px] font-semibold text-[var(--ov-accent-bright)] transition-all duration-300 hover:border-[rgba(200,169,126,0.35)] hover:bg-[rgba(200,169,126,0.1)] hover:shadow-[0_0_24px_rgba(200,169,126,0.1)] md:block"
              >
                Open the market
              </button>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="relative flex size-10 items-center justify-center rounded-xl border border-[var(--ov-border)] bg-[var(--ov-surface-0)] md:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                <div className="flex w-4 flex-col gap-[5px]">
                  <span
                    className="block h-[1.5px] w-full bg-[var(--ov-text)] transition-all duration-300"
                    style={{
                      transform: mobileOpen
                        ? "rotate(45deg) translate(2.3px, 2.3px)"
                        : "none",
                    }}
                  />
                  <span
                    className="block h-[1.5px] w-full bg-[var(--ov-text)] transition-all duration-300"
                    style={{
                      opacity: mobileOpen ? 0 : 1,
                      transform: mobileOpen ? "scaleX(0)" : "scaleX(1)",
                    }}
                  />
                  <span
                    className="block h-[1.5px] w-full bg-[var(--ov-text)] transition-all duration-300"
                    style={{
                      transform: mobileOpen
                        ? "rotate(-45deg) translate(2.3px, -2.3px)"
                        : "none",
                    }}
                  />
                </div>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 flex flex-col bg-[rgba(9,9,11,0.97)] backdrop-blur-2xl md:hidden"
          >
            <div className="h-16 sm:h-[4.5rem]" /> {/* Spacer for header */}

            <motion.nav
              variants={mobileLinkStagger}
              initial="closed"
              animate="open"
              className="flex flex-1 flex-col justify-center gap-2 px-8"
            >
              {NAV_LINKS.map((link) => (
                <motion.button
                  key={link.href}
                  variants={mobileLinkItem}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className="text-left font-display text-3xl font-light text-[var(--ov-text-muted)] transition-colors duration-200 hover:text-[var(--ov-text)] sm:text-4xl"
                >
                  {link.label}
                </motion.button>
              ))}

              <motion.div variants={mobileLinkItem} className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onCtaClick?.();
                  }}
                  className="rounded-2xl border border-[rgba(200,169,126,0.25)] bg-[rgba(200,169,126,0.08)] px-6 py-3.5 text-base font-semibold text-[var(--ov-accent-bright)] transition-all duration-300 hover:border-[rgba(200,169,126,0.4)] hover:bg-[rgba(200,169,126,0.14)]"
                >
                  Open the market
                </button>
              </motion.div>
            </motion.nav>

            {/* Bottom border accent */}
            <div className="px-8 pb-10">
              <div className="ov-divider" />
              <p className="mt-4 font-mono text-[10px] tracking-[0.18em] text-[var(--ov-text-dim)] uppercase">
                AI-Powered Service Marketplace
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
