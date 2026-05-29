"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type Cell = { row: number; col: number };

export function HeroRippleBackground({
  rows = 15,
  cols = 34,
  cellSize = 54,
}: {
  rows?: number;
  cols?: number;
  cellSize?: number;
}) {
  const [clickedCell, setClickedCell] = useState<Cell | null>(null);
  const [rippleKey, setRippleKey] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClickedCell({
        row: Math.floor(rows * (0.18 + Math.random() * 0.52)),
        col: Math.floor(cols * (0.46 + Math.random() * 0.42)),
      });
      setRippleKey((key) => key + 1);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [cols, rows]);

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full",
        "[--cell-border-color:var(--color-neutral-300)] [--cell-fill-color:var(--color-neutral-100)] [--cell-shadow-color:var(--color-neutral-500)]",
        "dark:[--cell-border-color:var(--color-neutral-700)] dark:[--cell-fill-color:var(--color-neutral-900)] dark:[--cell-shadow-color:var(--color-neutral-800)]",
      )}
    >
      <div className="relative h-auto w-auto overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          className="mask-radial-from-20% mask-radial-at-top opacity-600"
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((key) => key + 1);
          }}
        />
      </div>
    </div>
  );
}

function DivGrid({
  className,
  rows,
  cols,
  cellSize,
  borderColor,
  fillColor,
  clickedCell,
  onCellClick,
}: {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: Cell | null;
  onCellClick: (row: number, col: number) => void;
}) {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  return (
    <div
      className={cn("relative z-[3]", className)}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        width: cols * cellSize,
        height: rows * cellSize,
        marginInline: "auto",
      }}
    >
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;

        return (
          <div
            key={idx}
            className={cn(
              "cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]",
              clickedCell && "animate-cell-ripple [animation-fill-mode:none]",
            )}
            style={{
              backgroundColor: fillColor,
              borderColor,
              "--delay": `${clickedCell ? Math.max(0, distance * 55) : 0}ms`,
              "--duration": `${200 + distance * 80}ms`,
            } as React.CSSProperties}
            onClick={() => onCellClick(rowIdx, colIdx)}
          />
        );
      })}
    </div>
  );
}
