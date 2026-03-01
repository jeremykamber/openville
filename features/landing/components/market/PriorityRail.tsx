"use client";

import { handoffPreferences } from "@/features/landing/data/storyboard-fixtures";

interface PriorityRailProps {
  emphasizeHuman?: boolean;
}

export function PriorityRail({ emphasizeHuman = false }: PriorityRailProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {handoffPreferences.map((pref) => (
        <div
          key={pref.label}
          className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.14em] uppercase ${
            emphasizeHuman
              ? pref.source === "inferred"
                ? "ov-chip-signal"
                : "ov-chip-human"
              : "ov-chip"
          }`}
        >
          {pref.label}: {pref.value}
        </div>
      ))}
    </div>
  );
}
