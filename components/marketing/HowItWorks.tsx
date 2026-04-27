/**
 * Visual reference: DESIGN_SYSTEM/ui_kits/website/HowItWorksSection.jsx.
 */

const steps = [
  {
    n: "01",
    title: "Connect your device",
    body: "Power on GripFit and open the iOS app. It pairs via Bluetooth in seconds — no account required to start measuring.",
  },
  {
    n: "02",
    title: "Squeeze and measure",
    body: "Grip the device and apply max force for 5–10 seconds. The app captures your full force curve in real time, both hands separately.",
  },
  {
    n: "03",
    title: "Track your readiness",
    body: "View fatigue index, endurance score, and daily readiness output. Build your baseline over time for precision insight.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border/40 bg-background/40 px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
            How it works
          </div>
          <h2 className="font-display text-[clamp(24px,3vw,38px)] font-extrabold leading-[1.2] tracking-[-0.03em] text-foreground">
            Three steps to clarity.
          </h2>
        </div>

        <ol className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="flex gap-4">
              <span className="mt-1 shrink-0 font-display text-xs font-bold uppercase tracking-[0.04em] text-primary/80">
                {step.n}
              </span>
              <div>
                <span
                  aria-hidden
                  className="mb-3.5 block h-0.5 w-8 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--color-primary), var(--color-chart-5))",
                  }}
                />
                <h3 className="mb-2 font-display text-lg font-bold leading-snug text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-[1.7] text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
