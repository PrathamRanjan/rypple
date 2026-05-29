"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const FILLERS = /\b(please\s+|kindly\s+|could\s+you\s+|can\s+you\s+|would\s+you\s+|I\s+would\s+like\s+you\s+to\s+|I\s+want\s+you\s+to\s+|feel\s+free\s+to\s+|don't\s+hesitate\s+to\s+|as\s+you\s+know[,\s]+|it\s+is\s+important\s+to\s+note\s+that\s+|basically\s+|essentially\s+)/gi;
const IN_ORDER_TO = /\bin\s+order\s+to\s+/gi;

const VERB_SWAPS: [RegExp, string][] = [
  [/\banalyze\b/gi, "list"], [/\banalyse\b/gi, "list"],
  [/\belaborate\b/gi, "list"], [/\bdiscuss\b/gi, "list"],
  [/\bexplore\b/gi, "list"], [/\bexamine\b/gi, "assess"],
  [/\bdescribe\b/gi, "state"], [/\bexplain\b/gi, "state"],
  [/\btell\s+me\s+about\b/gi, "state"], [/\bwalk\s+me\s+through\b/gi, "list"],
];

const EXAMPLES = [
  "Could you please explain how neural networks work and walk me through backpropagation in order to help me understand it better?",
  "I would like you to analyse the key differences between REST and GraphQL APIs and describe when you would use each one.",
  "Can you basically tell me about the main causes of climate change and explore the most effective solutions?",
  "Would you please describe the difference between RAM and ROM and essentially explain why both are needed in a computer?",
];

function applyOptimisation(text: string, mode: "light" | "full") {
  let out = text.replace(FILLERS, "").replace(IN_ORDER_TO, "to ");
  for (const [pat, rep] of VERB_SWAPS) out = out.replace(pat, rep);
  out = out.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const directive = mode === "full" ? " Only provide the minimal answer." : " Answer briefly.";
  if (!out.includes("Answer briefly") && !out.includes("minimal answer")) out = out.trimEnd() + directive;
  return out;
}

function countTokens(text: string) { return Math.ceil(text.length / 4); }

function computeSavings(orig: string, mod: string, mode: "light" | "full") {
  const inputSaved = Math.max(0, countTokens(orig) - countTokens(mod));
  const reductionPct = mode === "full" ? 0.61 : 0.53;
  const outputSaved = Math.round(276 * reductionPct);
  const total = inputSaved + outputSaved;
  const whSaved = (outputSaved * 1.50) / 1000;
  const co2g = (whSaved / 1000) * 386;
  return { inputSaved, outputSaved, total, mwh: whSaved * 1000, co2g };
}

function HighlightedDiff({ original, optimised }: { original: string; optimised: string }) {
  const parts: { text: string; type: "removed" | "added" | "same" }[] = [];

  const origWords = original.split(/(\s+)/);
  const optWords = optimised.split(/(\s+)/);
  const optSet = new Set(optWords);
  const origSet = new Set(origWords);

  origWords.forEach((w) => {
    if (!optSet.has(w) && w.trim()) parts.push({ text: w, type: "removed" });
    else parts.push({ text: w, type: "same" });
  });

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[10px] uppercase tracking-widest text-white/30">Before</p>
        <p className="text-sm leading-6 text-white/60">{original}</p>
      </div>
      <div className="border-t border-white/8 pt-3">
        <p className="mb-1.5 text-[10px] uppercase tracking-widest text-white/30">After</p>
        <p className="text-sm leading-6">
          {optimised.split(" ").map((word, i) => {
            const isDirective = word === "briefly." || word === "Answer" || word === "Only" || word === "provide" || word === "the" || word === "minimal" || word === "answer.";
            const isNew = !origSet.has(word) && !origSet.has(word + " ");
            return (
              <span key={i}>
                <span className={cn(
                  isDirective && optimised.includes(word) && !original.includes(word)
                    ? "text-emerald-400"
                    : "text-white/80"
                )}>
                  {word}
                </span>
                {" "}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}

export function LiveOptimizer() {
  const [text, setText] = useState(EXAMPLES[0]);
  const [mode, setMode] = useState<"light" | "full">("light");

  const optimised = useMemo(() => applyOptimisation(text, mode), [text, mode]);
  const savings = useMemo(() => computeSavings(text, optimised, mode), [text, optimised, mode]);
  const changed = optimised !== text + (mode === "full" ? " Only provide the minimal answer." : " Answer briefly.");

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
        <p className="text-xs uppercase tracking-widest text-white/40">Live optimiser</p>
        <div className="flex gap-1 rounded-md border border-white/10 p-0.5">
          {([["light", "O-S2"], ["full", "O-S1"]] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-3 py-1 text-xs transition-colors",
                mode === m ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/8">
        {/* Input */}
        <div className="p-5">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-white/30">Your prompt</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-none rounded-lg border border-white/8 bg-white/[0.03] p-3 text-sm text-white/80 placeholder-white/20 outline-none focus:border-white/20 transition-colors h-36"
            placeholder="Type a prompt to optimise..."
          />
          <div className="mt-3 flex flex-wrap gap-1">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setText(ex)}
                className="rounded border border-white/8 px-2 py-1 text-[10px] text-white/30 hover:text-white/60 hover:border-white/16 transition-colors"
              >
                Example {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="p-5">
          <HighlightedDiff original={text} optimised={optimised} />
        </div>
      </div>

      {/* Savings bar */}
      <div className="border-t border-white/8 bg-white/[0.02] px-5 py-3">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/30">Tokens saved</p>
            <p className="text-lg font-medium text-white tabular-nums">~{savings.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/30">mWh saved</p>
            <p className="text-lg font-medium text-white tabular-nums">{savings.mwh.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/30">g CO₂</p>
            <p className="text-lg font-medium text-white tabular-nums">{savings.co2g.toFixed(4)}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/30">Input tokens</p>
            <p className="text-sm text-white/50 tabular-nums">
              {countTokens(text)} → {countTokens(optimised)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
