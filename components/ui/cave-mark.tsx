import * as React from "react";

/* The CaveMark: an 8x8 hollow pixel flame. This bitmap is the logo, and it is
 * the same grid the console and the extension icons are generated from. Drawn
 * as one path of squares so it stays crisp at 16px and inherits currentColor. */
const FLAME = [
  "00011000",
  "00111100",
  "00111100",
  "01100110",
  "01100110",
  "11000011",
  "01100110",
  "00111100",
];

export function CaveMark({ size = 18, className }: { size?: number; className?: string }) {
  const cells: React.ReactNode[] = [];
  FLAME.forEach((row, y) => {
    [...row].forEach((bit, x) => {
      if (bit === "1") cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    });
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      fill="currentColor"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Caveman"
      className={className}
    >
      {cells}
    </svg>
  );
}
