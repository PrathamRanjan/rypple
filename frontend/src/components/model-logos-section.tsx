"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

// ── Data ────────────────────────────────────────────────────────────────────

const AI_MODELS = [
  { src: "/logos/chatgpt.png",  label: "ChatGPT",   provider: "OpenAI",         pad: "p-4" },
  { src: "/logos/claude.png",   label: "Claude",     provider: "Anthropic",      pad: "p-4" },
  { src: "/logos/gemini.png",   label: "Gemini",     provider: "Google",         pad: "p-4" },
  { src: "/logos/per.png",      label: "Perplexity", provider: "Perplexity AI",  pad: "p-2" },
  { src: "/logos/deepseek.png", label: "DeepSeek",   provider: "DeepSeek",       pad: "p-4" },
];

const HEADLINE = "works with every model";
const ICON_CENTER = Math.floor(AI_MODELS.length / 2);

// ── Bracket SVG (from text-scroll-animation) ────────────────────────────────

function Bracket({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 27 78" className={className}>
      <path
        fill="currentColor"
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      />
    </svg>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────


function AnimatedLogo({
  model,
  index,
  scrollYProgress,
}: {
  model: (typeof AI_MODELS)[0];
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Each logo fades up at a slightly offset scroll window — smooth stagger
  const start = 0.05 + index * 0.06;
  const end   = start + 0.28;

  const y       = useTransform(scrollYProgress, [start, end], [28, 0]);
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const scale   = useTransform(scrollYProgress, [start, end], [0.88, 1]);

  return (
    <motion.div
      className="flex flex-col items-center gap-3 will-change-transform"
      style={{ y, opacity, scale, transformOrigin: "center" }}
    >
      {/* Logo container — dark pill so white logos are visible */}
      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.06] ${model.pad} shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.08)]`}>
        <img
          src={model.src}
          alt={model.label}
          className="h-full w-full object-contain"
          style={{
            filter: "brightness(0) invert(1) drop-shadow(0 0 4px rgba(255,255,255,0.6))",
          }}
        />
      </div>
      {/* Label */}
      <div className="text-center">
        <p className="text-xs font-medium text-white/60">{model.label}</p>
        <p className="text-[10px] text-white/25">{model.provider}</p>
      </div>
    </motion.div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export function ModelLogosSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={containerRef}
      className="relative h-[180vh] border-b border-white/8 bg-black"
    >
      {/* Sticky inner — stays centred while container scrolls */}
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-12 overflow-hidden px-5">

        {/* Static headline with brackets */}
        <h2 className="flex items-center justify-center gap-4 text-center text-4xl font-medium tracking-tight text-white sm:text-6xl">
          <Bracket className="h-10 shrink-0 text-white/40 sm:h-14" />
          {HEADLINE}
          <Bracket className="h-10 shrink-0 scale-x-[-1] text-white/40 sm:h-14" />
        </h2>

        {/* Animated logos */}
        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-10">
          {AI_MODELS.map((model, i) => (
            <AnimatedLogo
              key={model.label}
              model={model}
              index={i}
              centerIndex={ICON_CENTER}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        {/* Bottom caption */}
        <motion.p
          className="max-w-sm text-center text-sm text-white/30 leading-6"
          style={{ opacity: useTransform(scrollYProgress, [0.5, 0.75], [0, 1]) }}
        >
          Benchmarked across 10 models, 6 datasets, and 48,575 runs.
          Same directive. Different energy costs.
        </motion.p>
      </div>
    </section>
  );
}
