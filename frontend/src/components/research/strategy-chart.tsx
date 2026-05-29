"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type Strategy = {
  id: string;
  desc: string;
  type: "input" | "output" | "combined";
  rougeGain: number;
  outputReduction: number;
  status: "best" | "good" | "moderate" | "baseline" | "failed";
};

export const ALL_STRATEGIES: Strategy[] = [
  { id: "O-S1", desc: "\"Only provide the minimal answer.\"", type: "output", rougeGain: 99, outputReduction: 64, status: "best" },
  { id: "O-S4", desc: "\"Do not show reasoning. Final answer only.\"", type: "output", rougeGain: 80, outputReduction: 46, status: "good" },
  { id: "C-S2", desc: "Filler + verb swap + inline scope + O-S1", type: "combined", rougeGain: 53, outputReduction: 60, status: "good" },
  { id: "O-S2", desc: "\"Answer briefly.\"", type: "output", rougeGain: 50, outputReduction: 56, status: "good" },
  { id: "C-S3", desc: "Filler + verb swap + inline scope + O-S2", type: "combined", rougeGain: 34, outputReduction: 53, status: "good" },
  { id: "I-S5", desc: "Hybrid: inline output-scope directive appended", type: "combined", rougeGain: 28, outputReduction: 49, status: "good" },
  { id: "C-S1", desc: "Filler + verb swap + inline scope (hybrid)", type: "combined", rougeGain: 27, outputReduction: 46, status: "good" },
  { id: "I-S3", desc: "Reformat prose into bullet points", type: "input", rougeGain: 1, outputReduction: -1, status: "moderate" },
  { id: "I-S2", desc: "Verb substitution", type: "input", rougeGain: 0, outputReduction: 2, status: "moderate" },
  { id: "I-S0", desc: "Baseline — no change", type: "input", rougeGain: 0, outputReduction: 0, status: "baseline" },
  { id: "O-S5", desc: "API reasoning effort = low (o4-mini, Claude, Gemini)", type: "output", rougeGain: 0, outputReduction: 8, status: "moderate" },
  { id: "I-S4", desc: "LLMLingua-2 AI compression at 50% token ratio", type: "input", rougeGain: -1, outputReduction: 0, status: "moderate" },
  { id: "I-S1", desc: "Filler word removal", type: "input", rougeGain: -1, outputReduction: 0, status: "moderate" },
  { id: "O-S3", desc: "\"Answer within 50 words.\" — degrades quality", type: "output", rougeGain: -13, outputReduction: 46, status: "failed" },
  { id: "I-S6", desc: "Chinese translation — BPE tokeniser expansion", type: "input", rougeGain: -50, outputReduction: -32, status: "failed" },
];

const TABS = [
  { id: "all", label: "All" },
  { id: "output", label: "Output" },
  { id: "combined", label: "Combined" },
  { id: "input", label: "Input" },
  { id: "failed", label: "Failed" },
] as const;

const TYPE_COLORS: Record<string, string> = {
  output: "bg-white",
  combined: "bg-white/65",
  input: "bg-white/40",
  baseline: "bg-white/15",
  failed: "bg-red-500/80",
};

const STATUS_BADGE: Record<string, string> = {
  best: "border-white/20 text-white bg-white/8",
  good: "border-white/10 text-white/60",
  moderate: "border-white/8 text-white/40",
  baseline: "border-white/8 text-white/25",
  failed: "border-red-500/30 text-red-400 bg-red-500/5",
};

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function Bar({ strategy, maxGain, active, index, metric }: {
  strategy: Strategy;
  maxGain: number;
  active: boolean;
  index: number;
  metric: "rougeGain" | "outputReduction";
}) {
  const [hovered, setHovered] = useState(false);
  const value = strategy[metric];
  const pct = Math.abs(value) / Math.abs(maxGain) * 100;
  const [animPct, setAnimPct] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setAnimPct(pct), index * 55);
    return () => clearTimeout(t);
  }, [active, pct, index]);

  const failed = strategy.status === "failed";
  const barClass = failed ? "bg-red-500/80" : TYPE_COLORS[strategy.type] ?? "bg-white/40";

  return (
    <div
      className="group relative grid grid-cols-[5.5rem_1fr_4.5rem] items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-white/[0.03] cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ID */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-white/50">{strategy.id}</span>
      </div>

      {/* Bar track */}
      <div className="relative h-px bg-white/8">
        <div
          className={cn("absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full transition-all duration-700 ease-out", barClass)}
          style={{ width: `${animPct}%`, transitionDelay: `${index * 45}ms` }}
        />
      </div>

      {/* Value */}
      <span className={cn("text-xs font-mono text-right tabular-nums", failed ? "text-red-400" : "text-white/70")}>
        {value > 0 ? "+" : ""}{value}%
      </span>

      {/* Hover tooltip */}
      {hovered && (
        <div className="absolute left-0 -top-14 z-20 min-w-[22rem] rounded-lg border border-white/10 bg-neutral-950 px-4 py-3 shadow-2xl pointer-events-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-white/40 mb-0.5">{strategy.id}</p>
              <p className="text-sm text-white">{strategy.desc}</p>
            </div>
            <span className={cn("shrink-0 mt-0.5 rounded border px-2 py-0.5 text-xs", STATUS_BADGE[strategy.status])}>
              {strategy.status}
            </span>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-white/40">
            <span>ROUGE-L: <span className="text-white/70">{strategy.rougeGain > 0 ? "+" : ""}{strategy.rougeGain}%</span></span>
            <span>Output: <span className="text-white/70">{strategy.outputReduction > 0 ? "−" : ""}{Math.abs(strategy.outputReduction)}%</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

export function StrategyChart() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [metric, setMetric] = useState<"rougeGain" | "outputReduction">("rougeGain");
  const { ref, inView } = useInView();

  const filtered = ALL_STRATEGIES.filter((s) => {
    if (activeTab === "all") return true;
    if (activeTab === "failed") return s.status === "failed";
    return s.type === activeTab;
  });

  const maxGain = Math.max(...ALL_STRATEGIES.map((s) => Math.abs(s[metric])));

  return (
    <div ref={ref} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Type filter */}
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === t.id
                  ? "bg-white text-black"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Metric toggle */}
        <div className="flex gap-1 rounded-md border border-white/10 p-0.5">
          {[
            { key: "rougeGain" as const, label: "ROUGE-L" },
            { key: "outputReduction" as const, label: "Output ↓" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded px-3 py-1 text-xs transition-colors",
                metric === m.key ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[5.5rem_1fr_4.5rem] gap-3 mb-1 px-2">
        <span className="text-[10px] uppercase tracking-widest text-white/20">Strategy</span>
        <span className="text-[10px] uppercase tracking-widest text-white/20">
          {metric === "rougeGain" ? "ROUGE-L improvement" : "Output reduction"}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-white/20 text-right">
          {metric === "rougeGain" ? "Gain" : "Saved"}
        </span>
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-0.5">
        {filtered.map((s, i) => (
          <Bar key={s.id} strategy={s} maxGain={maxGain} active={inView} index={i} metric={metric} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-4 border-t border-white/8 pt-4 text-xs text-white/30">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white inline-block" />Output strategy</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/60 inline-block" />Combined</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/35 inline-block" />Input strategy</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500/80 inline-block" />Failed</span>
      </div>
    </div>
  );
}
