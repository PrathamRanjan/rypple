"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const COUNTERS = [
  { value: 48575, label: "model runs", suffix: "", prefix: "" },
  { value: 10, label: "LLMs tested", suffix: "", prefix: "" },
  { value: 15, label: "strategies", suffix: "", prefix: "" },
  { value: 0.930, label: "inter-rater κ", suffix: "", prefix: "", decimals: 3 },
];

const TOP_STRATEGIES = [
  { id: "O-S1", label: "O-S1 — Only provide the minimal answer.", gain: 99, type: "output" },
  { id: "O-S4", label: "O-S4 — Do not show reasoning.", gain: 80, type: "output" },
  { id: "C-S2", label: "C-S2 — Input stack + O-S1", gain: 53, type: "combined" },
  { id: "O-S2", label: "O-S2 — Answer briefly.", gain: 50, type: "output" },
  { id: "C-S3", label: "C-S3 — Input stack + O-S2", gain: 34, type: "combined" },
  { id: "O-S3", label: "O-S3 — Answer within 50 words.", gain: -13, type: "output" },
];

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCounter(target: number, active: boolean, duration = 1400, decimals = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration, decimals]);
  return value;
}

function CounterCard({ value, label, suffix, prefix, decimals = 0, active }: {
  value: number; label: string; suffix: string; prefix: string; decimals?: number; active: boolean;
}) {
  const display = useCounter(value, active, 1600, decimals);
  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : display >= 1000
    ? Math.round(display).toLocaleString()
    : Math.round(display).toString();

  return (
    <div className="flex flex-col gap-1 border-b border-white/8 py-8 sm:border-b-0 sm:border-r last:border-r-0 px-6 first:pl-0 last:pr-0">
      <div className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
        {prefix}{formatted}{suffix}
      </div>
      <div className="text-sm text-white/40 uppercase tracking-[0.18em]">{label}</div>
    </div>
  );
}

function StrategyBar({ label, gain, type, active, maxGain, index }: {
  label: string; gain: number; type: string; active: boolean; maxGain: number; index: number;
}) {
  const [width, setWidth] = useState(0);
  const failed = gain < 0;
  const pct = Math.abs(gain) / maxGain * 100;

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setWidth(pct), index * 80);
    return () => clearTimeout(t);
  }, [active, pct, index]);

  const barColor = failed
    ? "bg-red-500/70"
    : type === "output"
    ? "bg-white"
    : type === "combined"
    ? "bg-white/70"
    : "bg-white/40";

  return (
    <div className="grid grid-cols-[7rem_1fr_4rem] items-center gap-3 py-2">
      <span className="text-xs font-mono text-white/40 truncate">{label.split(" — ")[0]}</span>
      <div className="relative h-px bg-white/8">
        <div
          className={cn("absolute left-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full transition-all duration-700 ease-out", barColor, failed && "right-0 left-auto")}
          style={{ width: `${width}%`, transitionDelay: `${index * 60}ms` }}
        />
      </div>
      <span className={cn("text-xs font-mono text-right tabular-nums", failed ? "text-red-400" : "text-white/70")}>
        {gain > 0 ? "+" : ""}{gain}%
      </span>
    </div>
  );
}

export function StatsSection() {
  const { ref, inView } = useInView(0.15);

  return (
    <section id="data" ref={ref} className="border-b border-white/10">
      <div className="mx-auto w-full max-w-6xl px-5 py-20">

        {/* Heading */}
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-white/36">
          The numbers
        </p>
        <h2 className="mb-16 text-4xl font-medium text-white sm:text-5xl">
          Benchmark at a glance.
        </h2>

        {/* Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-white/8 rounded-xl overflow-hidden mb-16">
          {COUNTERS.map((c) => (
            <CounterCard key={c.label} {...c} active={inView} />
          ))}
        </div>

        {/* Chart */}
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/36">
              ROUGE-L improvement over baseline
            </p>
            <p className="text-white/50 text-sm leading-6 max-w-sm">
              Output directives dominate. A single appended phrase outperforms
              every input-compression strategy — and some strategies actively hurt quality.
            </p>
            <div className="mt-8 flex flex-col gap-1">
              <div className="flex gap-4 mb-4 text-xs text-white/30">
                <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-white" />Output</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-white/60" />Combined</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-red-500/70" />Failed</span>
              </div>
              {TOP_STRATEGIES.map((s, i) => (
                <StrategyBar
                  key={s.id}
                  label={s.label}
                  gain={s.gain}
                  type={s.type}
                  active={inView}
                  maxGain={99}
                  index={i}
                />
              ))}
            </div>
            <a
              href="/research"
              className="mt-8 inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
            >
              See all 15 strategies
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Energy cards */}
          <div className="grid gap-3 content-start">
            <p className="text-xs uppercase tracking-[0.22em] text-white/36 mb-1">
              Energy savings per prompt (O-S1 directive)
            </p>
            {[
              { model: "Claude Sonnet", mwh: "310 mWh", co2: "0.071 g CO₂", icon: "A" },
              { model: "GPT-4.1 class", mwh: "230 mWh", co2: "0.089 g CO₂", icon: "G" },
              { model: "Gemini Flash", mwh: "196 mWh", co2: "0.004 g CO₂", icon: "G" },
            ].map(({ model, mwh, co2, icon }) => (
              <div key={model} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/8 text-xs text-white/50 font-medium">
                    {icon}
                  </div>
                  <span className="text-sm text-white/70">{model}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white tabular-nums">{mwh}</div>
                  <div className="text-xs text-white/36 tabular-nums">{co2}</div>
                </div>
              </div>
            ))}
            <p className="mt-2 text-xs text-white/28 leading-5">
              Jegham per-token energy × each model&apos;s matched O-S1 token reduction.
              CO₂ uses provider grid intensity (OpenAI 386, Anthropic 230, Google 18 g CO₂/kWh).
            </p>
            <a
              href="/research"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
            >
              Full methodology
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
