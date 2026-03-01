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
    <Card className="border-border/70 bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{body}</p>
        {actionLabel && onAction ? (
          <Button type="button" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
