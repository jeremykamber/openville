"use client";

import { useEffect, useRef, useState } from "react";

import type { WorkflowHomepageControls } from "@/features/workflow/client/types";
import { cn } from "@/lib/utils";

interface ArenaIntakeHeroProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  controls: WorkflowHomepageControls;
  onSpeedChange: (speed: WorkflowHomepageControls["speed"]) => void;
  onBudgetChange: (budget: string) => void;
}

const BUDGET_OPTIONS = [
  { label: "$250", value: "250" },
  { label: "$500", value: "500" },
  { label: "$1,000", value: "1000" },
  { label: "$2,500", value: "2500" },
  { label: "Custom", value: "" },
];

const SPEED_OPTIONS: Array<{
  value: WorkflowHomepageControls["speed"];
  label: string;
}> = [
  { value: "fastest", label: "Fast" },
  { value: "balanced", label: "Balanced" },
  { value: "best_quality", label: "Best quality" },
];

// A handful of fixed background agent nodes to create atmosphere
const BG_NODES = [
  { x: 8, y: 12, size: 6, opacity: 0.18, delay: 0 },
  { x: 92, y: 8, size: 5, opacity: 0.14, delay: 400 },
  { x: 5, y: 78, size: 7, opacity: 0.12, delay: 200 },
  { x: 94, y: 72, size: 6, opacity: 0.16, delay: 600 },
  { x: 15, y: 45, size: 4, opacity: 0.10, delay: 800 },
  { x: 85, y: 40, size: 5, opacity: 0.12, delay: 300 },
  { x: 50, y: 5, size: 4, opacity: 0.10, delay: 700 },
  { x: 50, y: 92, size: 5, opacity: 0.12, delay: 100 },
  { x: 25, y: 88, size: 4, opacity: 0.08, delay: 900 },
  { x: 75, y: 88, size: 4, opacity: 0.08, delay: 500 },
  { x: 3, y: 52, size: 3, opacity: 0.07, delay: 1100 },
  { x: 97, y: 52, size: 3, opacity: 0.07, delay: 1000 },
];

export function ArenaIntakeHero({
  value,
  onChange,
  onSubmit,
  disabled,
  controls,
  onSpeedChange,
  onBudgetChange,
}: ArenaIntakeHeroProps) {
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [budgetSelected, setBudgetSelected] = useState(false);
  const [showCustomBudget, setShowCustomBudget] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleChange(val: string) {
    onChange(val);
    if (!hasStartedTyping && val.length > 0) {
      setHasStartedTyping(true);
    }
  }

  function handleBudgetSelect(budgetValue: string) {
    if (budgetValue === "") {
      setShowCustomBudget(true);
      setBudgetSelected(true);
    } else {
      onBudgetChange(budgetValue);
      setBudgetSelected(true);
      setShowCustomBudget(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && budgetSelected && !disabled) {
      e.preventDefault();
      onSubmit();
    }
  }

  const canSubmit = budgetSelected && value.trim().length > 0 && !disabled;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070b09]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(74,222,128,0.04),transparent_70%)]" />
        <div className="absolute left-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-[radial-gradient(ellipse,rgba(74,222,128,0.03),transparent_70%)]" />
        <div className="absolute right-1/4 top-2/3 h-[250px] w-[250px] rounded-full bg-[radial-gradient(ellipse,rgba(200,150,80,0.025),transparent_70%)]" />
      </div>

      {/* Background agent nodes (atmosphere) */}
      <div className="pointer-events-none absolute inset-0">
        {BG_NODES.map((node, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] [animation:ov-pulse_4s_ease-in-out_infinite]"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              transform: "translate(-50%, -50%)",
              opacity: node.opacity,
              animationDelay: `${node.delay}ms`,
            }}
          />
        ))}
      </div>

      {/* Subtle dot grid */}
      <div className="pointer-events-none absolute inset-0 ov-grid opacity-[0.04]" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl space-y-8 px-6">
        {/* Eyebrow */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.04)] px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-[var(--ov-signal-strong)] uppercase">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--ov-signal-strong)] [animation:ov-pulse_2s_ease-in-out_infinite]" />
            Agent economy
          </span>
        </div>

        {/* Headline */}
        <div className="text-center">
          <h1 className="font-display text-5xl leading-[0.93] text-white sm:text-6xl lg:text-7xl">
            Who&apos;s going to
            <br />
            work for you?
          </h1>
          <p className="mt-5 text-base leading-7 text-[var(--ov-text-muted)]">
            Describe the job. Fifty agents compete. Three survive the cut.
            One wins on the same page.
          </p>
        </div>

        {/* Job input — the hero element */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the work — location, timeline, scope, any requirements..."
            rows={3}
            disabled={disabled}
            className="w-full resize-none rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-6 py-5 text-base leading-7 text-white placeholder:text-[var(--ov-text-muted)] backdrop-blur-sm transition focus:border-[rgba(74,222,128,0.4)] focus:bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-0 disabled:opacity-40"
          />
        </div>

        {/* Budget pills — animate in after first keystroke */}
        {hasStartedTyping && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <p className="mb-3 text-center text-[11px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
              Budget cap
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {BUDGET_OPTIONS.map((option) => {
                const isSelected =
                  option.value !== ""
                    ? controls.budget === option.value
                    : showCustomBudget;
                return (
                  <button
                    key={option.value || "custom"}
                    type="button"
                    onClick={() => handleBudgetSelect(option.value)}
                    className={cn(
                      "rounded-2xl border px-4 py-2 text-sm font-medium transition",
                      isSelected
                        ? "border-[rgba(74,222,128,0.5)] bg-[rgba(74,222,128,0.08)] text-[var(--ov-signal-strong)]"
                        : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[var(--ov-text-muted)] hover:border-[rgba(74,222,128,0.3)] hover:text-white",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {showCustomBudget && (
              <div className="mt-3 flex justify-center">
                <input
                  type="number"
                  min="0"
                  placeholder="Enter amount"
                  value={controls.budget}
                  onChange={(e) => onBudgetChange(e.target.value)}
                  className="w-40 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-center text-sm text-white placeholder:text-[var(--ov-text-muted)] focus:border-[rgba(74,222,128,0.4)] focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Speed toggle — animate in after budget selected */}
        {budgetSelected && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <p className="mb-3 text-center text-[11px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
              Speed
            </p>
            <div className="flex justify-center gap-2">
              {SPEED_OPTIONS.map((option) => {
                const isActive = controls.speed === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSpeedChange(option.value)}
                    className={cn(
                      "rounded-2xl border px-5 py-2 text-sm font-medium transition",
                      isActive
                        ? "border-[rgba(74,222,128,0.5)] bg-[rgba(74,222,128,0.08)] text-[var(--ov-signal-strong)]"
                        : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[var(--ov-text-muted)] hover:border-[rgba(74,222,128,0.3)] hover:text-white",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit */}
        {budgetSelected && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 flex justify-center">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className={cn(
                "rounded-3xl border px-8 py-4 text-base font-semibold tracking-[0.04em] transition",
                canSubmit
                  ? "border-[rgba(74,222,128,0.4)] bg-[rgba(74,222,128,0.08)] text-[var(--ov-signal-strong)] hover:bg-[rgba(74,222,128,0.14)] hover:border-[rgba(74,222,128,0.6)]"
                  : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[var(--ov-text-muted)] cursor-not-allowed",
              )}
            >
              {disabled ? "Launching..." : "Launch agent economy →"}
            </button>
          </div>
        )}

        {/* Example chips */}
        {!hasStartedTyping && (
          <div className="animate-in fade-in duration-700 mt-4 flex flex-wrap justify-center gap-2">
            {[
              "Fix storm-damaged gutters before Friday under $900 in Austin",
              "Top-rated event crew for a weekend rooftop launch in LA",
              "Emergency electrician tonight for a restaurant panel issue",
            ].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleChange(example)}
                className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-left text-xs text-[var(--ov-text-muted)] transition hover:border-[rgba(74,222,128,0.2)] hover:text-white"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
