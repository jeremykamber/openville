/**
 * Openville logo mark — a constellation / network graph.
 * Center node with satellite nodes connected by thin lines.
 * Uses `currentColor` so it inherits text color from parent.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  // Center node
  const cx = 16;
  const cy = 16;

  // Satellite positions — intentionally asymmetric for organic feel
  const satellites = [
    { x: 6, y: 5 },
    { x: 27, y: 7 },
    { x: 4, y: 22 },
    { x: 28, y: 20 },
    { x: 16, y: 29 },
  ];

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Connecting lines — center to each satellite */}
      {satellites.map((s, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={s.x}
          y2={s.y}
          stroke="currentColor"
          strokeWidth={0.8}
          strokeOpacity={0.35}
        />
      ))}

      {/* Satellite nodes */}
      {satellites.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={2}
          fill="currentColor"
          fillOpacity={0.7}
        />
      ))}

      {/* Center node — larger, full opacity */}
      <circle cx={cx} cy={cy} r={3} fill="currentColor" />
    </svg>
  );
}
