/** Sixteen-point wind rose, after the compass roses on medieval portolan charts. */
export function WindRose({ className = "", title }: { className?: string; title?: string }) {
  const points = Array.from({ length: 32 }, (_, i) => {
    const angle = (i * Math.PI) / 16 - Math.PI / 2;
    const r = i % 8 === 0 ? 50 : i % 4 === 0 ? 30 : i % 2 === 0 ? 19 : 7;
    return `${(50 + r * Math.cos(angle)).toFixed(2)},${(50 + r * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <polygon points={points} fill="currentColor" />
    </svg>
  );
}
