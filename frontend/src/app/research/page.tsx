import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { StrategyChart } from "@/components/research/strategy-chart";
import { LiveOptimizer } from "@/components/research/live-optimizer";
import { ModelEnergyChart } from "@/components/research/model-energy-chart";

export const metadata: Metadata = {
  title: "Research — TRIM Benchmark | Rypple",
  description:
    "The TRIM benchmark: 15 prompt-optimisation strategies tested across 10 LLMs, 6 datasets, and 48,575 model runs. Full methodology, results, and interactive data.",
};

const DATASETS = [
  { name: "GooAQ", domain: "Factual Q&A", items: 50, notes: "Short, direct answers" },
  { name: "TriviaQA", domain: "Fact verification", items: 50, notes: "Short factual recall" },
  { name: "AG News", domain: "Classification", items: 50, notes: "4-class news category" },
  { name: "MS MARCO", domain: "Open QA", items: 50, notes: "Medium-length passages" },
  { name: "LIMA", domain: "Open instruction", items: 50, notes: "Long, varied instructions" },
  { name: "XSum", domain: "Summarisation", items: 50, notes: "Long article summaries" },
];

const KEY_FINDINGS = [
  {
    stat: "+99%",
    label: "ROUGE-L improvement",
    desc: "O-S1 — \"Only provide the minimal answer.\" — the single best strategy. One appended phrase outperforms all input-compression approaches combined.",
  },
  {
    stat: "64%",
    label: "output token reduction",
    desc: "O-S1 cuts model output length by 64% on average across 10 models and 6 datasets while raising reference-overlap quality (Wilcoxon p < 0.0042 after Bonferroni).",
  },
  {
    stat: "κ = 0.930",
    label: "inter-rater agreement",
    desc: "LLM-as-judge evaluation using cross-provider assignment (Claude judges OpenAI/Gemini; GPT judges Anthropic). Almost perfect agreement (n=47 overlap items, κ > 0.80 threshold).",
  },
  {
    stat: "+79%",
    label: "input token increase",
    desc: "I-S6 (Chinese translation) failed: BPE tokenisers do not compress CJK text more efficiently. Tokens increased, not decreased. The hypothesis was definitively killed.",
  },
];

const MODELS = [
  { name: "GPT-5", provider: "OpenAI" },
  { name: "GPT-5.5", provider: "OpenAI" },
  { name: "GPT-4.1", provider: "OpenAI" },
  { name: "GPT-4.1-mini", provider: "OpenAI" },
  { name: "GPT-4.1-nano", provider: "OpenAI" },
  { name: "o4-mini", provider: "OpenAI" },
  { name: "Claude Opus 4.7", provider: "Anthropic" },
  { name: "Claude Sonnet 4.6", provider: "Anthropic" },
  { name: "Claude Haiku 4.5", provider: "Anthropic" },
  { name: "Gemini 2.5 Flash", provider: "Google" },
];

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-white/8 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Rypple
          </Link>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <a href="#benchmark" className="hover:text-white transition-colors">Benchmark</a>
            <a href="#strategies" className="hover:text-white transition-colors">Strategies</a>
            <a href="#energy" className="hover:text-white transition-colors">Energy</a>
            <a href="#methodology" className="hover:text-white transition-colors">Methodology</a>
            <a href="#demo" className="hover:text-white transition-colors">Try it</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-white/8">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <p className="mb-6 text-sm uppercase tracking-[0.28em] text-white/36">
            TRIM Benchmark · 2025
          </p>
          <h1 className="max-w-4xl text-5xl font-medium leading-[1.05] text-white sm:text-7xl">
            15 strategies.<br />10 models.<br />48,575 runs.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/56">
            We tested every major prompt-compression strategy across a full factorial design —
            input rewriting, output directives, and combined stacks — to find what actually
            reduces AI energy use without degrading response quality.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="https://github.com/prathamranjann/rypple"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/16 px-5 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
            >
              GitHub
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm text-black hover:bg-white/90 transition-colors"
            >
              Try the live optimiser
            </a>
          </div>
        </div>
      </section>

      {/* Key findings */}
      <section id="benchmark" className="border-b border-white/8">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="mb-4 text-sm uppercase tracking-[0.24em] text-white/36">Key findings</p>
          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {KEY_FINDINGS.map((f) => (
              <div key={f.stat} className="bg-black p-6">
                <div className="mb-2 text-4xl font-medium text-white tabular-nums">{f.stat}</div>
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-white/40">{f.label}</div>
                <p className="text-sm leading-6 text-white/52">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy chart */}
      <section id="strategies" className="border-b border-white/8">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="mb-4 text-sm uppercase tracking-[0.24em] text-white/36">Strategy explorer</p>
          <h2 className="mb-3 text-3xl font-medium text-white sm:text-4xl">
            All 15 strategies ranked.
          </h2>
          <p className="mb-10 max-w-2xl text-white/50 leading-7">
            Filter by type. Toggle between ROUGE-L quality gain and output token reduction.
            Hover any bar for details. Output directives consistently outperform input compression.
          </p>
          <StrategyChart />

          {/* Callout: failed strategies */}
          <div className="mt-8 rounded-xl border border-red-500/15 bg-red-500/[0.03] p-6">
            <p className="mb-2 text-sm font-medium text-red-400">Two strategies failed</p>
            <div className="grid gap-4 sm:grid-cols-2 text-sm text-white/50 leading-6">
              <div>
                <span className="font-mono text-white/70 mr-2">O-S3</span>
                "Answer within 50 words." degraded ROUGE-L by 12%. Hard word limits cause models to
                truncate answers mid-thought, degrading lexical overlap with reference answers.
              </div>
              <div>
                <span className="font-mono text-white/70 mr-2">I-S6</span>
                Chinese translation increased input tokens by 79%. BPE tokenisers used by OpenAI, Anthropic,
                and Google do not encode CJK characters more efficiently than English.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Energy section */}
      <section id="energy" className="border-b border-white/8">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="mb-4 text-sm uppercase tracking-[0.24em] text-white/36">Energy impact</p>
          <h2 className="mb-3 text-3xl font-medium text-white sm:text-4xl">
            Not all models cost the same.
          </h2>
          <p className="mb-10 max-w-2xl text-white/50 leading-7">
            Energy per output token varies 61× across model families (0.30 mWh/token for GPT-4.1-nano to 18.35 mWh/token for GPT-5). The same directive saves
            dramatically more energy on a large reasoning model than a lightweight flash model.
          </p>
          <ModelEnergyChart />
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="border-b border-white/8">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="mb-4 text-sm uppercase tracking-[0.24em] text-white/36">Methodology</p>
          <h2 className="mb-10 text-3xl font-medium text-white sm:text-4xl">
            How we measured it.
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Design */}
            <div className="rounded-xl border border-white/8 p-6">
              <h3 className="mb-4 text-base font-medium text-white">Experimental design</h3>
              <ul className="space-y-3 text-sm leading-6 text-white/52">
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>15 core strategies + O-S5-medium/high variants; 10 models × 6 datasets × 50 items; 48,575 clean rows</li>
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>Primary seed 42 (44,365 rows); partial seed 123/456 replication (4,210 rows)</li>
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>SQLite checkpointing — each cell saved on completion, resumable at any point</li>
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>Async execution with rate-limit backoff per provider</li>
              </ul>
            </div>

            {/* Quality eval */}
            <div className="rounded-xl border border-white/8 p-6">
              <h3 className="mb-4 text-base font-medium text-white">Quality evaluation</h3>
              <ul className="space-y-3 text-sm leading-6 text-white/52">
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>Primary metric: ROUGE-L (longest common subsequence F1 vs. reference answer)</li>
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>LLM-as-judge secondary: cross-provider assignment (Claude judges OpenAI/Gemini; GPT judges Anthropic)</li>
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>Non-inferiority threshold: 5% relative ROUGE-L drop; Wilcoxon signed-rank with Bonferroni correction</li>
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>Cohen's κ = 0.930 inter-rater agreement between the two cross-provider LLM judges (n=47 overlap items, κ &gt; 0.80 threshold)</li>
              </ul>
            </div>

            {/* Energy */}
            <div className="rounded-xl border border-white/8 p-6">
              <h3 className="mb-4 text-base font-medium text-white">Energy measurement</h3>
              <ul className="space-y-3 text-sm leading-6 text-white/52">
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>Jegham et al. (2025) formula: mWh = output_tokens × k, where k is model-family constant</li>
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>EcoLogits ISO 14044 LCA validation via free REST API (35,574 rows backfilled)</li>
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>CO₂ conversion: 386 g CO₂/kWh (US grid average, EPA 2023)</li>
                <li className="flex gap-3"><span className="text-white/25 shrink-0">—</span>Four-method framework: Jegham, EcoLogits, latency proxy, cost proxy</li>
              </ul>
            </div>

            {/* Datasets */}
            <div className="rounded-xl border border-white/8 p-6">
              <h3 className="mb-4 text-base font-medium text-white">Datasets — 6 benchmarks</h3>
              <div className="space-y-2">
                {DATASETS.map((d) => (
                  <div key={d.name} className="flex items-start justify-between gap-4 text-sm">
                    <div>
                      <span className="text-white/70">{d.name}</span>
                      <span className="ml-2 text-white/28">{d.domain}</span>
                    </div>
                    <span className="shrink-0 text-xs text-white/28">{d.notes}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Models */}
          <div className="mt-8 rounded-xl border border-white/8 p-6">
            <h3 className="mb-5 text-base font-medium text-white">Models tested — 10 LLMs</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {MODELS.map((m) => (
                <div key={m.name} className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
                  <p className="text-xs font-medium text-white/70">{m.name}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{m.provider}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live demo */}
      <section id="demo" className="border-b border-white/8">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="mb-4 text-sm uppercase tracking-[0.24em] text-white/36">Interactive</p>
          <h2 className="mb-3 text-3xl font-medium text-white sm:text-4xl">
            Try the optimiser.
          </h2>
          <p className="mb-10 max-w-2xl text-white/50 leading-7">
            Type any prompt. The I-S1 (filler removal) and I-S2 (verb swap) strategies run instantly
            in your browser. The output directive (O-S1 or O-S2) is appended and token savings
            estimated using TRIM energy constants — all client-side, zero API calls.
          </p>
          <LiveOptimizer />
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-4 border-t border-white/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <img src="/rypple-logo.png" alt="" className="h-5 w-5 invert" />
            <span className="text-sm font-medium text-white">Rypple</span>
            <span className="text-sm text-white/30 ml-2">TRIM Benchmark, 2025</span>
          </div>
          <div className="flex gap-5 text-sm text-white/40">
            <a
              href="https://github.com/prathamranjann/rypple"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              GitHub <ArrowUpRight className="h-3 w-3" />
            </a>
            <Link href="/" className="hover:text-white transition-colors">Homepage</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
