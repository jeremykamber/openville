"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RequestComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function RequestComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: RequestComposerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Example: Fix my gutters this week. I care most about price."
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit();
          }
        }}
        className="h-12 rounded-xl border-border/70 bg-background"
      />
      <Button
        type="button"
        size="lg"
        onClick={onSubmit}
        disabled={disabled || value.trim().length === 0}
        className="rounded-xl px-5"
      >
        {disabled ? "Searching..." : "Find matches"}
      </Button>
    </div>
  );
}
