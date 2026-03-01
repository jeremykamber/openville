"use client";

import { storyPriorities } from "@/features/landing/data/storyboard-fixtures";

interface PriorityRailProps {
  emphasizeHuman?: boolean;
}

export function PriorityRail({ emphasizeHuman = false }: PriorityRailProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {storyPriorities.map((priority) => (
        <div
          key={priority.label}
          className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.14em] uppercase ${
            emphasizeHuman ? "ov-chip-human" : "ov-chip"
          }`}
        >
          {priority.label}: {priority.value}
        </div>
      ))}
    </div>
  );
}
