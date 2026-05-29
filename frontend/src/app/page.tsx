import { ArrowUpRight } from "lucide-react";

import { BenefitsSection } from "@/components/benefits-section";
import { CanvasRippleField } from "@/components/canvas-ripple-field";
import { CarbonFooter } from "@/components/carbon-footer";
import { HeroRippleBackground } from "@/components/hero-ripple-background";
import { StatsSection } from "@/components/stats-section";
import { ModelLogosSection } from "@/components/model-logos-section";


export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <ModelLogosSection />
      <BenefitsSection />
      <StatsSection />
      <CanvasSection />
      <section className="mx-auto w-full max-w-6xl px-5 pb-8">
        <CarbonFooter />
      </section>
    </main>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden border-b border-white/10 bg-black">
      <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_top,black_0%,black_42%,transparent_78%)]">
        <HeroRippleBackground rows={15} cols={34} cellSize={54} />
      </div>
      {/* Bigger spotlight — increased from 30% to 52% */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(255,255,255,0.26),transparent_52%),linear-gradient(180deg,rgba(0,0,0,0.06),#000_84%)]" />
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-7">
        <nav className="pointer-events-auto flex items-center justify-between text-sm">
          <a href="#" className="flex items-center gap-2 font-medium tracking-tight text-white">
            <img src="/rypple-logo.png" alt="Rypple" className="h-6 w-6 invert" />
            Rypple
          </a>
          <div className="hidden gap-8 text-white/50 sm:flex">
            <a className="transition hover:text-white" href="#data">Data</a>
            <a className="transition hover:text-white" href="/research">Research</a>
            <a className="transition hover:text-white" href="#carbon">Carbon</a>
          </div>
        </nav>

        <div className="flex flex-1 items-center py-24">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-medium leading-[0.92] tracking-normal text-white sm:text-8xl lg:text-9xl">
              Prompt better.<br />Waste less.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">
              A Chrome extension for ChatGPT, Claude, and Gemini — and a native
              skill for Claude Code. Cuts AI energy use by up to{" "}
              <span className="text-white font-medium">64%</span>, verified
              across 48,575 model runs.
            </p>
            <div className="pointer-events-auto mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://github.com/prathamranjann/rypple"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-white/88"
              >
                Install free on Chrome
                <ArrowUpRight className="size-4" />
              </a>
              <a
                href="/research"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-transparent px-6 text-sm font-medium text-white transition-colors hover:bg-white/8"
              >
                View methodology
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function CanvasSection() {
  return (
    <section className="relative border-b border-white/8 bg-black overflow-hidden">
      {/* Radial glow behind the canvas */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_50%,rgba(255,255,255,0.07),transparent_70%)]" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        {/* Canvas wrapped in a glowing frame */}
        <div className="relative">
          <div className="pointer-events-none absolute -inset-px rounded-xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
          <CanvasRippleField />
        </div>
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.24em] text-white/34">
            Compound
          </p>
          <h2 className="text-4xl font-medium tracking-normal text-white sm:text-6xl">
            Small savings compound.
          </h2>
          <p className="mt-6 max-w-xl leading-7 text-white/52">
            One cleaner prompt is minor. The same habit repeated across a team is
            where energy, cost, and time start to move.
          </p>
          <p className="mt-4 text-sm text-white/32">
            1,000 users × 1 prompt/day × 146 tokens saved = <span className="text-white/60">~319 mWh/month</span>
          </p>
        </div>
      </div>
    </section>
  );
}
