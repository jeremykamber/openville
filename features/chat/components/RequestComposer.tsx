"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RequestComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  variant?: "landing" | "active";
  submitLabel?: string;
  loadingLabel?: string;
  /** Optional example prompts shown as clickable chips below the input */
  examples?: string[];
  /** Called when an example chip is clicked — typically sets the input value */
  onExampleClick?: (example: string) => void;
}

export function RequestComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  variant = "active",
  submitLabel,
  loadingLabel,
  examples,
  onExampleClick,
}: RequestComposerProps) {
  const isLanding = variant === "landing";
  const resolvedSubmitLabel =
    submitLabel ?? (isLanding ? "Open the market" : "Draft request");
  const resolvedLoadingLabel =
    loadingLabel ?? (isLanding ? "Opening market..." : "Preparing brief...");

  return (
    <div className="space-y-3">
      <div
        className={`flex flex-col gap-3 rounded-[1.5rem] border p-4 shadow-[0_20px_50px_var(--ov-shadow)] backdrop-blur sm:flex-row sm:items-center ${
          isLanding
            ? "border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] sm:p-5"
            : "border-[var(--ov-border-soft)] bg-[var(--ov-surface-deep)]"
        }`}
      >
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Describe the scope, deadline, and trade-offs."
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            }
          }}
          className={`h-13 rounded-[1.2rem] border px-4 text-sm text-[var(--ov-text)] placeholder:text-[var(--ov-text-muted)] ${
            isLanding
              ? "border-[var(--ov-signal-border)] bg-[var(--ov-surface-0)]"
              : "border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)]"
          }`}
        />
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={disabled || value.trim().length === 0}
          className={`rounded-[1.2rem] px-5 font-semibold ${
            isLanding
              ? "bg-[var(--ov-human)] text-[var(--ov-text-on-accent)] hover:bg-[#e8a882]"
              : "bg-[var(--ov-signal)] text-[var(--ov-text-on-accent)] hover:bg-[var(--ov-signal-strong)]"
          }`}
        >
          {disabled ? resolvedLoadingLabel : resolvedSubmitLabel}
        </Button>
      </div>
      {examples && examples.length > 0 ? (
        <div
          className={`flex flex-wrap gap-2 ${
            isLanding ? "justify-start" : "justify-center"
          }`}
        >
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onExampleClick?.(example)}
              disabled={disabled}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                isLanding
                  ? "border-[var(--ov-human-border)] bg-[var(--ov-human-bg)] text-[var(--ov-human)] hover:border-[var(--ov-human-hover)] hover:text-[var(--ov-human)]"
                  : "border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text-muted)] hover:border-[var(--ov-signal-hover)] hover:text-[var(--ov-text)]"
              }`}
            >
              {example}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
