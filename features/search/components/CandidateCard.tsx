"use client";

import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import type { Candidate } from "@/features/shared/contracts/Candidate";

// ── Motion config ────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cardEntrance = {
  hidden: { opacity: 0, y: 20, scale: 0.97, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRate(
  hourlyRate: number | undefined,
  basePrice: number | undefined,
) {
  if (hourlyRate != null) {
    return `$${hourlyRate}/hr`;
  }
  if (basePrice != null) {
    return `From $${basePrice}`;
  }
  return "Custom quote";
}

// ── Component ────────────────────────────────────────────────────────────────

interface CandidateCardProps {
  candidate: Candidate;
  rank: number;
}

/**
 * CandidateCard — Displays a single ranked tradesperson candidate.
 *
 * Shows key decision-making info: name, description, specialties,
 * pricing, availability, location, and track record.
 *
 * Uses the new Candidate type aligned with the dev branch.
 * Optional fields are handled gracefully with fallbacks.
 */
export function CandidateCard({ candidate, rank }: CandidateCardProps) {
  return (
    <motion.article
      variants={cardEntrance}
      className="group relative overflow-hidden rounded-[1.75rem] border border-[rgba(124,170,255,0.14)] bg-[linear-gradient(180deg,rgba(15,31,58,0.80),rgba(10,22,40,0.85))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.42)] transition-shadow duration-400 hover:shadow-[0_28px_72px_rgba(0,0,0,0.52),0_0_40px_rgba(59,130,246,0.06)] sm:p-6"
    >
      {/* Hover glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          boxShadow:
            "inset 0 0 32px rgba(59,130,246,0.05), 0 0 48px rgba(59,130,246,0.03)",
        }}
      />

      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge className="border-0 bg-[rgba(59,130,246,0.12)] text-[var(--ov-signal-bright)]">
            Rank #{rank}
          </Badge>
          <Badge className="border-0 bg-[rgba(245,158,11,0.12)] text-[var(--ov-human-bright)]">
            Score {(candidate.score * 100).toFixed(0)}
          </Badge>
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-2xl text-[var(--ov-text)]">
            {candidate.name}
          </h3>
          {candidate.description && (
            <p className="text-sm text-[var(--ov-text-muted)]">
              {candidate.description}
            </p>
          )}
        </div>

        {candidate.specialties && candidate.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {candidate.specialties.map((specialty) => (
              <Badge
                key={specialty}
                className="border-0 bg-[rgba(59,130,246,0.10)] text-[var(--ov-text)]"
              >
                {specialty}
              </Badge>
            ))}
          </div>
        )}

        <dl className="grid gap-3 text-sm text-[var(--ov-text-muted)] sm:grid-cols-2">
          <div>
            <dt className="font-medium text-[var(--ov-text)]">Rate</dt>
            <dd>{formatRate(candidate.hourlyRate, candidate.basePrice)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--ov-text)]">Availability</dt>
            <dd>{candidate.availability ?? "Contact for availability"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--ov-text)]">Location</dt>
            <dd>{candidate.location ?? "Remote / Flexible"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--ov-text)]">Track record</dt>
            <dd>
              {candidate.rating} stars, {candidate.successCount} completed jobs
              {candidate.yearsExperience != null &&
                `, ${candidate.yearsExperience}yr experience`}
            </dd>
          </div>
          {candidate.responseTime && (
            <div>
              <dt className="font-medium text-[var(--ov-text)]">
                Response time
              </dt>
              <dd>{candidate.responseTime}</dd>
            </div>
          )}
          {candidate.certifications && candidate.certifications.length > 0 && (
            <div>
              <dt className="font-medium text-[var(--ov-text)]">
                Certifications
              </dt>
              <dd>{candidate.certifications.join(", ")}</dd>
            </div>
          )}
        </dl>
      </div>
    </motion.article>
  );
}
