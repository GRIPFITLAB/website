/**
 * How it works — vertical step rail with WHOOP "built to be worn 24/7"
 * pacing: each step gets a big numeral, a short imperative title, and
 * one paragraph of supporting copy. The hairline purple rail down the
 * left stitches the steps together.
 */
const steps = [
  {
    n: "01",
    title: "Squeeze.",
    body: "Grip the device with a comfortable full-palm hold and apply maximum force for 5–10 seconds. The strain-gauge load cell captures every Newton.",
  },
  {
    n: "02",
    title: "See the curve.",
    body: "Bluetooth streams 100 samples per second to your iPhone. Peak force, rate of force development, and fatigue tail render in real time on the iOS app.",
  },
  {
    n: "03",
    title: "Read your readiness.",
    body: "After seven daily measurements GripFit builds your baseline and turns each session into a 0–100 readiness score. Drift below your baseline; train above it.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-y border-border-hairline bg-bg-deep py-24 md:py-32">
      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="mb-16 grid gap-8 md:mb-20 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-eyebrow mb-5 text-accent">
              How it works
            </p>
            <h2 className="font-display text-display-xl text-text-primary">
              Three motions to a baseline.
            </h2>
          </div>
          <p className="max-w-md text-[17px] leading-[1.7] text-text-secondary md:col-span-6 md:col-start-7 md:self-end">
            GripFit is built to be effortless. Squeeze, look, decide — the
            full loop is under 30 seconds, twice a day, every day.
          </p>
        </div>

        <ol className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-[10px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-accent/50 via-accent/25 to-transparent md:block"
          />
          {steps.map((step, index) => (
            <li
              key={step.n}
              className="relative grid gap-8 border-t border-border-hairline py-12 last:border-b md:grid-cols-12 md:py-16"
            >
              <div className="flex items-start gap-5 md:col-span-5">
                <span
                  aria-hidden
                  className="relative mt-2 hidden size-[22px] shrink-0 items-center justify-center rounded-full border border-accent bg-bg-canvas md:flex"
                >
                  <span className="size-1.5 rounded-full bg-accent" />
                </span>
                <span className="font-display text-[80px] font-medium leading-none tracking-[-0.025em] text-accent tabular-nums md:text-[112px]">
                  {step.n}
                </span>
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <h3 className="font-display text-display-lg text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-md text-[16px] leading-[1.7] text-text-secondary">
                  {step.body}
                </p>
              </div>
              <span className="absolute right-0 top-12 text-eyebrow text-text-tertiary md:top-16">
                Step {index + 1}/{steps.length}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
