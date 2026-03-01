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
    <Card className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] shadow-[0_20px_50px_var(--ov-shadow)]">
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
            className="border-[var(--ov-signal-border)] bg-[var(--ov-signal-soft)] text-[var(--ov-signal-strong)] hover:bg-[var(--ov-signal-hover)] hover:text-[var(--ov-text)]"
          >
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
