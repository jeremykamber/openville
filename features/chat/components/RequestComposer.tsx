"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RequestComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  variant?: "landing" | "active";
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
  examples,
  onExampleClick,
}: RequestComposerProps) {
  const isLanding = variant === "landing";

  return (
    <div className="space-y-3">
      <div
        className={`flex flex-col gap-3 rounded-[1.5rem] border p-4 shadow-[0_20px_50px_rgba(2,6,15,0.35)] backdrop-blur sm:flex-row sm:items-center ${
          isLanding
            ? "border-[rgba(124,170,255,0.16)] bg-[rgba(8,15,27,0.72)] sm:p-5"
            : "border-[rgba(124,170,255,0.12)] bg-[rgba(7,17,29,0.78)]"
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
              ? "border-[rgba(124,170,255,0.18)] bg-[rgba(13,23,38,0.88)]"
              : "border-[rgba(124,170,255,0.14)] bg-[rgba(13,23,38,0.94)]"
          }`}
        />
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={disabled || value.trim().length === 0}
          className={`rounded-[1.2rem] px-5 font-semibold ${
            isLanding
              ? "bg-[var(--ov-human)] text-[#06111d] hover:bg-[#f7cb90]"
              : "bg-[var(--ov-signal)] text-[#06111d] hover:bg-[var(--ov-signal-strong)]"
          }`}
        >
          {disabled
            ? "Opening market..."
            : isLanding
              ? "Open the market"
              : "Run ranking"}
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
                  ? "border-[rgba(242,191,122,0.2)] bg-[rgba(242,191,122,0.08)] text-[var(--ov-human)] hover:border-[rgba(242,191,122,0.38)] hover:text-[#f7cb90]"
                  : "border-[rgba(124,170,255,0.16)] bg-[rgba(9,17,29,0.74)] text-[var(--ov-text-muted)] hover:border-[rgba(103,215,255,0.32)] hover:text-[var(--ov-text)]"
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
