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
    <Card className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] shadow-[0_20px_50px_var(--ov-shadow)]">
      <CardHeader className="gap-3">
        <CardTitle className="font-display text-xl text-[var(--ov-text)]">
          Context snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {followUpQuestion ? (
          <p className="rounded-2xl border border-dashed border-[var(--ov-signal-border)] bg-[var(--ov-surface-card)] px-4 py-3 text-sm text-[var(--ov-text-muted)]">
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
