"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserPreferences } from "@/features/shared/contracts/UserPreferences";

interface FollowUpPromptProps {
  followUpQuestion: string | null;
  preferences: UserPreferences | null;
}

export function FollowUpPrompt({
  followUpQuestion,
  preferences,
}: FollowUpPromptProps) {
  if (!followUpQuestion && !preferences) {
    return null;
  }

  return (
    <Card className="border-[rgba(124,170,255,0.16)] bg-[rgba(9,17,29,0.84)] shadow-[0_20px_50px_rgba(2,6,15,0.35)]">
      <CardHeader className="gap-3">
        <CardTitle className="font-display text-xl text-[var(--ov-text)]">
          Context snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {followUpQuestion ? (
          <p className="rounded-2xl border border-dashed border-[rgba(124,170,255,0.18)] bg-[rgba(13,23,38,0.72)] px-4 py-3 text-sm text-[var(--ov-text-muted)]">
            {followUpQuestion}
          </p>
        ) : null}
        {preferences ? (
          <div className="flex flex-wrap gap-2">
            <Badge className="ov-chip border-0">Budget: {preferences.budgetPriority}</Badge>
            <Badge className="ov-chip border-0">Timeline: {preferences.timeline}</Badge>
            <Badge className="ov-chip border-0">Quality: {preferences.qualityPriority}</Badge>
            <Badge className="ov-chip-human border-0">
              Max budget: {preferences.maxBudget ? `$${preferences.maxBudget}` : "not set"}
            </Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
