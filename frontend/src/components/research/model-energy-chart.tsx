"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Model = {
  name: string;
  provider: string;
  mwhPerToken: number;
  color: string;
};

const MODELS: Model[] = [
  { name: "GPT-5", provider: "OpenAI", mwhPerToken: 18.35, color: "bg-emerald-300/90" },
  { name: "GPT-5.5", provider: "OpenAI", mwhPerToken: 18.35, color: "bg-emerald-300/80" },
  { name: "Claude Opus 4.7", provider: "Anthropic", mwhPerToken: 4.50, color: "bg-orange-300/80" },
  { name: "o4-mini", provider: "OpenAI", mwhPerToken: 3.00, color: "bg-emerald-300/70" },
  { name: "Claude Sonnet 4.6", provider: "Anthropic", mwhPerToken: 2.10, color: "bg-orange-300/60" },
  { name: "GPT-4.1", provider: "OpenAI", mwhPerToken: 1.50, color: "bg-emerald-300/55" },
  { name: "GPT-4.1-mini", provider: "OpenAI", mwhPerToken: 0.80, color: "bg-emerald-300/40" },
  { name: "Gemini 2.5 Flash", provider: "Google", mwhPerToken: 0.60, color: "bg-sky-300/70" },
  { name: "Claude Haiku 4.5", provider: "Anthropic", mwhPerToken: 0.50, color: "bg-orange-300/40" },
  { name: "GPT-4.1-nano", provider: "OpenAI", mwhPerToken: 0.30, color: "bg-emerald-300/25" },
];

const DIRECTIVES = [
  { label: "Baseline", pct: 0, desc: "No directive" },
  { label: "O-S2", pct: 53, desc: "Answer briefly." },
  { label: "O-S1", pct: 61, desc: "Only provide the minimal answer." },
];

const MAX_MWH_PER_TOKEN = 18.35;
const AVG_OUTPUT = 265; // baseline (I-S0) average output tokens

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

function ModelBar({ model, effectiveOutput, maxMwh, inView, index }: {
  model: Model; effectiveOutput: number; maxMwh: number; inView: boolean; index: number;
}) {
  const mwh = model.mwhPerToken * effectiveOutput;
  const pct = (mwh / maxMwh) * 100;
  const [animPct, setAnimPct] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!inView) return;
    setAnimPct(0);
    const t = setTimeout(() => setAnimPct(pct), index * 60);
    return () => clearTimeout(t);
  }, [inView, pct, index]);

  return (
    <div
      className="group grid grid-cols-[10rem_1fr_5rem] items-center gap-4 rounded-md px-2 py-2 hover:bg-white/[0.03] transition-colors cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <p className="text-xs text-white/60 truncate">{model.name}</p>
        <p className="text-[10px] text-white/28">{model.provider}</p>
      </div>
      <div className="relative h-px bg-white/8">
        <div
          className={cn("absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full transition-all duration-700 ease-out", model.color)}
          style={{ width: `${animPct}%`, transitionDelay: `${index * 50}ms` }}
        />
      </div>
      <div className="text-right">
        <span className="text-xs font-mono text-white/60 tabular-nums">{mwh.toFixed(1)} mWh</span>
      </div>
    </div>
  );
}

export function ModelEnergyChart() {
  const { ref, inView } = useInView();
  const [directive, setDirective] = useState<0 | 1 | 2>(0);

  const reductionPct = DIRECTIVES[directive].pct / 100;
  const effectiveOutput = Math.round(AVG_OUTPUT * (1 - reductionPct));
  const maxMwh = MAX_MWH_PER_TOKEN * AVG_OUTPUT;

  return (
    <div ref={ref} className="space-y-6">
      {/* Directive selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/40">
          Showing mWh per prompt at{" "}
          <span className="text-white/70">{effectiveOutput}</span> output tokens
          {directive > 0 && (
            <span className="text-white/40"> (−{DIRECTIVES[directive].pct}% from directive)</span>
          )}
        </p>
        <div className="flex gap-1 rounded-md border border-white/10 p-0.5 w-fit">
          {DIRECTIVES.map((d, i) => (
            <button
              key={d.label}
              onClick={() => setDirective(i as 0 | 1 | 2)}
              className={cn(
                "rounded px-3 py-1.5 text-xs transition-colors",
                directive === i ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6">
        <div className="space-y-3">
          {MODELS.map((model, i) => (
            <ModelBar
              key={model.name}
              model={model}
              effectiveOutput={effectiveOutput}
              maxMwh={maxMwh}
              inView={inView}
              index={i}
            />
          ))}
        </div>

        {/* X-axis */}
        <div className="mt-4 grid grid-cols-[10rem_1fr_5rem] gap-4 px-2">
          <div />
          <div className="flex justify-between text-[10px] text-white/20">
            <span>0</span>
            <span>{(maxMwh / 2).toFixed(0)} mWh</span>
            <span>{maxMwh.toFixed(0)} mWh</span>
          </div>
          <div />
        </div>
      </div>

      {/* Savings callout when directive active */}
      {directive > 0 && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-6 py-5">
          <p className="mb-3 text-xs uppercase tracking-widest text-white/30">
            Savings per prompt with {DIRECTIVES[directive].desc}
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: "GPT-5", k: 18.35 },
              { label: "Claude Opus 4.7", k: 4.50 },
              { label: "Claude Sonnet 4.6", k: 2.10 },
              { label: "GPT-4.1-nano", k: 0.30 },
            ].map(({ label, k }: { label: string; k: number }) => {
              const saved = (k * AVG_OUTPUT) - (k * effectiveOutput);
              return (
                <div key={label}>
                  <p className="text-[10px] text-white/30">{label}</p>
                  <p className="text-2xl font-medium text-white tabular-nums">{saved.toFixed(1)}</p>
                  <p className="text-[10px] text-white/30">mWh saved</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Provider legend */}
      <div className="flex flex-wrap gap-4 text-xs text-white/30">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-300/70 inline-block" />Anthropic</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-300/70 inline-block" />OpenAI</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-300/60 inline-block" />Google</span>
      </div>
    </div>
  );
}
