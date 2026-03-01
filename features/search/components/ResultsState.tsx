"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultsStateProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ResultsState({
  title,
  body,
  actionLabel,
  onAction,
}: ResultsStateProps) {
  return (
    <Card className="border-[rgba(124,170,255,0.16)] bg-[rgba(9,17,29,0.84)] shadow-[0_20px_50px_rgba(2,6,15,0.35)]">
      <CardHeader>
        <CardTitle className="font-display text-xl text-[var(--ov-text)]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-[var(--ov-text-muted)]">{body}</p>
        {actionLabel && onAction ? (
          <Button
            type="button"
            variant="outline"
            onClick={onAction}
            className="border-[rgba(103,215,255,0.24)] bg-[rgba(103,215,255,0.08)] text-[var(--ov-signal-strong)] hover:bg-[rgba(103,215,255,0.14)] hover:text-[var(--ov-text)]"
          >
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
