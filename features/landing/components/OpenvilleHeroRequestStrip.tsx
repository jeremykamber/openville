"use client";

import { useRef, useState, useCallback } from "react";

import {
  OPENVILLE_LAUNCH_EVENT,
  type OpenvilleLaunchSeed,
} from "@/features/shared/contracts/openvilleDemo";

const EXAMPLES = [
  "Emergency plumber for a restaurant kitchen tonight",
  "Wedding AV crew for 200 guests next Saturday",
  "Storm-damaged gutters before the next rain window",
];

function dispatchLaunch(seed: OpenvilleLaunchSeed) {
  window.dispatchEvent(
    new CustomEvent<OpenvilleLaunchSeed>(OPENVILLE_LAUNCH_EVENT, {
      detail: seed,
    }),
  );
}

function scrollToMarket() {
  document.getElementById("live-market")?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });
}

export function OpenvilleHeroRequestStrip() {
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const launchTokenRef = useRef(0);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, []);

  function launch(nextQuery: string, source: OpenvilleLaunchSeed["source"]) {
    const trimmed = nextQuery.trim();
    scrollToMarket();
    if (!trimmed) return;

    launchTokenRef.current += 1;
    dispatchLaunch({
      query: trimmed,
      token: launchTokenRef.current,
      source,
    });
    setQuery(trimmed);
  }

  const hasInput = query.trim().length > 0;

  return (
    <div className="mx-auto w-full">
      <form
        className="rounded-2xl border border-white/[0.06] bg-[rgba(12,9,6,0.88)] shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(249,115,22,0.03)] backdrop-blur-2xl transition-all duration-300 focus-within:border-[#f97316]/20 focus-within:shadow-[0_8px_48px_rgba(0,0,0,0.5),0_0_80px_rgba(249,115,22,0.05)] sm:rounded-3xl lg:rounded-[2rem]"
        onSubmit={(e) => {
          e.preventDefault();
          launch(query, "hero");
        }}
      >
        <div className="px-5 pt-5 pb-3 sm:px-7 sm:pt-6 sm:pb-4 lg:px-8 lg:pt-7 lg:pb-5">
          <label className="sr-only" htmlFor="ov-hero-query">
            Describe the work you need
          </label>
          <textarea
            ref={textareaRef}
            id="ov-hero-query"
            rows={2}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              autoResize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                launch(query, "hero");
              }
            }}
            placeholder="Describe the job and let the market run."
            className="w-full resize-none bg-transparent text-base leading-relaxed text-stone-200 outline-none placeholder:text-stone-600 sm:text-lg lg:text-xl"
            style={{ minHeight: "56px", maxHeight: "240px" }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pb-4 sm:px-7 sm:pb-5 lg:px-8 lg:pb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <label className="sr-only" htmlFor="ov-hero-budget">
                Budget
              </label>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-stone-500 sm:left-4 sm:text-xs">
                $
              </span>
              <input
                id="ov-hero-budget"
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Budget"
                className="h-9 w-[110px] rounded-xl border border-white/[0.06] bg-white/[0.03] pl-6 pr-3 font-mono text-xs text-stone-300 outline-none transition [appearance:textfield] placeholder:text-stone-600 focus:border-[#f97316]/30 sm:h-10 sm:w-[130px] sm:pl-7 sm:text-sm lg:h-11 lg:w-[150px] lg:pl-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            <div className="hidden items-center gap-1.5 sm:flex lg:gap-2">
              {(["search", "rank", "negotiate", "book"] as const).map(
                (step, i) => (
                  <span key={step} className="flex items-center gap-1.5 lg:gap-2">
                    <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-stone-600/50 sm:text-[8px] lg:text-[9px]">
                      {step}
                    </span>
                    {i < 3 && (
                      <span className="text-[6px] text-stone-700/30 sm:text-[7px]">
                        &middot;
                      </span>
                    )}
                  </span>
                ),
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!hasInput}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 disabled:cursor-default disabled:opacity-30 sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-2xl"
            style={{
              background: hasInput
                ? "linear-gradient(135deg, #f97316, #ea580c)"
                : "rgba(255,255,255,0.05)",
            }}
            aria-label="Run market"
          >
            <svg
              className={`h-4 w-4 sm:h-[18px] sm:w-[18px] lg:h-5 lg:w-5 ${hasInput ? "text-white" : "text-stone-500"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2 px-2 sm:gap-2.5 lg:gap-3">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => launch(ex, "hero")}
            className="cursor-pointer rounded-full border border-white/[0.05] bg-white/[0.02] px-3.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-stone-500 transition-all duration-200 hover:border-[#f97316]/20 hover:bg-[#f97316]/[0.04] hover:text-[#e8cdb5] sm:px-4 sm:py-2 sm:text-[9px] lg:px-5 lg:py-2.5 lg:text-[10px]"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
