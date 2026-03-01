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
    <Card className="border-border/70 bg-background/90 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge>Rank #{rank}</Badge>
          <Badge variant="outline">Score {candidate.score}</Badge>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">{candidate.name}</CardTitle>
          <CardDescription>{candidate.headline}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{candidate.summary}</p>
        <div className="flex flex-wrap gap-2">
          {candidate.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary">
              {specialty}
            </Badge>
          ))}
        </div>
        <dl className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Starting price</dt>
            <dd>{formatStartingPrice(candidate.startingPrice)}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Availability</dt>
            <dd>{candidate.availabilityLabel}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Location</dt>
            <dd>{candidate.locationLabel}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Track record</dt>
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
