"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Candidate } from "@/features/shared/contracts/Candidate";

function formatStartingPrice(startingPrice: number | null) {
  if (startingPrice === null) {
    return "Custom quote";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(startingPrice);
}

interface CandidateCardProps {
  candidate: Candidate;
  rank: number;
}

export function CandidateCard({ candidate, rank }: CandidateCardProps) {
  return (
    <Card className="overflow-hidden border-[rgba(124,170,255,0.16)] bg-[linear-gradient(180deg,rgba(19,32,51,0.92),rgba(7,17,29,0.94))] shadow-[0_24px_60px_rgba(2,6,15,0.42)]">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge className="border-0 bg-[rgba(103,215,255,0.14)] text-[var(--ov-signal-strong)]">
            Rank #{rank}
          </Badge>
          <Badge className="border-0 bg-[rgba(255,209,102,0.14)] text-[var(--ov-winner)]">
            Score {candidate.score}
          </Badge>
        </div>
        <div className="space-y-1">
          <CardTitle className="font-display text-2xl text-[var(--ov-text)]">
            {candidate.name}
          </CardTitle>
          <CardDescription className="text-[var(--ov-text-muted)]">
            {candidate.headline}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
          {candidate.summary}
        </p>
        <div className="flex flex-wrap gap-2">
          {candidate.specialties.map((specialty) => (
            <Badge
              key={specialty}
              className="border-0 bg-[rgba(124,170,255,0.1)] text-[var(--ov-text)]"
            >
              {specialty}
            </Badge>
          ))}
        </div>
        <dl className="grid gap-3 text-sm text-[var(--ov-text-muted)] sm:grid-cols-2">
          <div>
            <dt className="font-medium text-[var(--ov-text)]">Starting price</dt>
            <dd>{formatStartingPrice(candidate.startingPrice)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--ov-text)]">Availability</dt>
            <dd>{candidate.availabilityLabel}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--ov-text)]">Location</dt>
            <dd>{candidate.locationLabel}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--ov-text)]">Track record</dt>
            <dd>
              {candidate.rating} stars, {candidate.reviewCount} reviews,{" "}
              {candidate.successCount} completed jobs
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
