const BENEFITS = [
  {
    stat: "Input",
    label: "Lighter prompts",
    title: "Save on input.",
    body:
      "Strip redundant context, polite filler, and template padding before the prompt ever leaves the page. Smaller payloads cost fewer tokens, every call.",
  },
  {
    stat: "Output",
    label: "The dominant lever",
    title: "Save on output.",
    body:
      "Append the right brevity directive and outputs shrink hard. O-S1 alone cuts output length by 64% on average across 10 models and 6 datasets — verified across 48,575 runs.",
  },
  {
    stat: "κ = 0.930",
    label: "Inter-rater agreement",
    title: "Retain quality.",
    body:
      "Verified, not promised. Cross-provider LLM judges hit almost-perfect agreement that the top directives preserve answer correctness — and on ROUGE-L, several actively raise it.",
  },
];

export function BenefitsSection() {
  return (
    <section className="relative border-b border-white/8 bg-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_30%,rgba(255,255,255,0.05),transparent_70%)]" />
      <div className="relative mx-auto w-full max-w-6xl px-5 py-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.24em] text-white/34">
            Where it saves
          </p>
          <h2 className="text-4xl font-medium tracking-normal text-white sm:text-6xl">
            Cut input. Cut output. <span className="text-white/55">Keep the quality.</span>
          </h2>
          <p className="mt-6 max-w-2xl leading-7 text-white/52">
            Rypple works on both ends of the prompt — input minimisation before
            the call, output directives appended to it. The benchmark shows
            both levers move energy without dropping answer correctness.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="flex flex-col gap-4 bg-black p-8"
            >
              <div className="flex flex-col gap-1">
                <div className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
                  {b.stat}
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                  {b.label}
                </div>
              </div>
              <div className="mt-2 h-px w-8 bg-white/20" />
              <h3 className="text-lg font-medium text-white">{b.title}</h3>
              <p className="text-sm leading-6 text-white/52">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
