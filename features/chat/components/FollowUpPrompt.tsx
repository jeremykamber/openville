"use client";

import { AnimatePresence, motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import type { UserPreferences } from "@/features/shared/contracts/UserPreferences";

// ── Motion config ────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const panelReveal = {
  hidden: { opacity: 0, y: 20, scale: 0.98, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: EASE },
  },
};

const badgeStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const badgeItem = {
  hidden: { opacity: 0, scale: 0.88, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: EASE },
  },
};

// ── Component ────────────────────────────────────────────────────────────────

interface FollowUpPromptProps {
  followUpQuestion: string | null;
  preferences: UserPreferences | null;
}

/**
 * FollowUpPrompt — Shows the agent's understanding of user preferences
 * and any follow-up questions. Displayed after initial request submission.
 *
 * Renders preference badges using the new UserPreferences shape.
 */
export function FollowUpPrompt({
  followUpQuestion,
  preferences,
}: FollowUpPromptProps) {
  const hasContent = followUpQuestion || preferences;

  return (
    <AnimatePresence mode="wait">
      {hasContent ? (
        <motion.div
          key="follow-up"
          variants={panelReveal}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="rounded-[2rem] border border-[rgba(124,170,255,0.14)] bg-[linear-gradient(180deg,rgba(15,28,48,0.82),rgba(9,17,29,0.88))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-6"
        >
          <h3 className="font-display text-xl text-[var(--ov-text)]">
            Context snapshot
          </h3>

          <div className="mt-4 space-y-4">
            {followUpQuestion ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
                className="rounded-2xl border border-dashed border-[rgba(124,170,255,0.16)] bg-[rgba(13,23,38,0.68)] px-4 py-3 text-sm leading-7 text-[var(--ov-text-muted)]"
              >
                {followUpQuestion}
              </motion.p>
            ) : null}
            {preferences ? (
              <motion.div
                variants={badgeStagger}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-2"
              >
                {preferences.priority && (
                  <motion.div variants={badgeItem}>
                    <Badge className="ov-chip-signal border-0">
                      Priority: {preferences.priority}
                    </Badge>
                  </motion.div>
                )}
                {preferences.availability && (
                  <motion.div variants={badgeItem}>
                    <Badge className="ov-chip border-0">
                      Availability: {preferences.availability}
                    </Badge>
                  </motion.div>
                )}
                {preferences.budget != null && (
                  <motion.div variants={badgeItem}>
                    <Badge className="ov-chip-human border-0">
                      Budget: ${preferences.budget.toLocaleString()}
                    </Badge>
                  </motion.div>
                )}
                {preferences.location && (
                  <motion.div variants={badgeItem}>
                    <Badge className="ov-chip border-0">
                      Location: {preferences.location}
                    </Badge>
                  </motion.div>
                )}
                {preferences.minRating != null && (
                  <motion.div variants={badgeItem}>
                    <Badge className="ov-chip border-0">
                      Min rating: {preferences.minRating}+
                    </Badge>
                  </motion.div>
                )}
                {preferences.dealBreakers &&
                  preferences.dealBreakers.length > 0 && (
                    <motion.div variants={badgeItem}>
                      <Badge className="ov-chip border-0 border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.08)] text-[var(--ov-danger)]">
                        Deal breakers: {preferences.dealBreakers.length}
                      </Badge>
                    </motion.div>
                  )}
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
