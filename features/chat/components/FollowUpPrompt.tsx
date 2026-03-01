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
    <Card className="border-border/70 bg-background/80 shadow-sm">
      <CardHeader className="gap-3">
        <CardTitle className="text-base">Context snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {followUpQuestion ? (
          <p className="rounded-xl border border-dashed border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {followUpQuestion}
          </p>
        ) : null}
        {preferences ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Budget: {preferences.budgetPriority}</Badge>
            <Badge variant="secondary">Timeline: {preferences.timeline}</Badge>
            <Badge variant="secondary">Quality: {preferences.qualityPriority}</Badge>
            <Badge variant="outline">
              Max budget: {preferences.maxBudget ? `$${preferences.maxBudget}` : "not set"}
            </Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
