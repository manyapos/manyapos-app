export function Logo({ className = "", size = 28 }: { className?: string; size?: number }) {
  const boxSize = size * 0.35
  const gap = size * 0.08
  const r = size * 0.07

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
      aria-label="Manya logo"
    >
      {/* Top-left — filled */}
      <rect x={0} y={0} width={boxSize} height={boxSize} rx={r} fill="currentColor" />
      {/* Top-right — outline */}
      <rect x={boxSize + gap} y={0} width={boxSize} height={boxSize} rx={r} fill="currentColor" opacity={0.3} />
      {/* Bottom-left — outline */}
      <rect x={0} y={boxSize + gap} width={boxSize} height={boxSize} rx={r} fill="currentColor" opacity={0.3} />
      {/* Bottom-right — filled */}
      <rect x={boxSize + gap} y={boxSize + gap} width={boxSize} height={boxSize} rx={r} fill="currentColor" />
    </svg>
  )
}
