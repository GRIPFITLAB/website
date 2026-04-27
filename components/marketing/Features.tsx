import { Activity, BarChart3, Smartphone, Zap } from "lucide-react";

/**
 * Visual reference: DESIGN_SYSTEM/ui_kits/website/FeaturesSection.jsx.
 * Per Decisions.md §16 Q1, Home page does NOT include a SocialProofSection.
 */

interface Feature {
  title: string;
  body: string;
  /** A `--color-*` token name. Used for the icon tile bg/border tint. */
  accentToken:
    | "--color-chart-5"
    | "--color-primary"
    | "--color-success"
    | "--color-chart-3";
  Icon: typeof Zap;
}

const features: Feature[] = [
  {
    title: "Precision force sensing",
    body: "Strain-gauge load cell accurate to ±0.5 lbs. Captures peak force, rate of force development, and fatigue curves every squeeze.",
    accentToken: "--color-chart-5",
    Icon: Zap,
  },
  {
    title: "Left / right tracking",
    body: "Measure dominant and non-dominant hands independently. Asymmetry analysis flags imbalances before they become injuries.",
    accentToken: "--color-primary",
    Icon: BarChart3,
  },
  {
    title: "Readiness intelligence",
    body: "Grip strength correlates with CNS fatigue. GripFit turns daily measurements into a single, precise readiness score.",
    accentToken: "--color-success",
    Icon: Activity,
  },
  {
    title: "iOS companion app",
    body: "Real-time force curves, session history, 7-day trends, and streak tracking. Connects via Bluetooth in under 3 seconds.",
    accentToken: "--color-primary",
    Icon: Smartphone,
  },
];

export function Features() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-24">
      <div className="mb-14 text-center md:mb-16">
        <div className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
          Why GripFit
        </div>
        <h2 className="font-display text-[clamp(26px,3.5vw,44px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-foreground">
          Every metric that matters.
          <br />
          <span className="font-normal text-muted-foreground">
            Nothing that doesn&apos;t.
          </span>
        </h2>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const accent = `var(${feature.accentToken})`;
          return (
            <li
              key={feature.title}
              className="rounded-2xl border border-border bg-card/70 p-7 backdrop-blur-md"
            >
              <div
                className="mb-5 flex size-11 items-center justify-center rounded-[12px]"
                style={{
                  background: `color-mix(in oklab, ${accent} 9%, transparent)`,
                  border: `1px solid color-mix(in oklab, ${accent} 19%, transparent)`,
                  color: accent,
                }}
              >
                <feature.Icon className="size-5" />
              </div>
              <h3 className="mb-2.5 font-display text-base font-bold leading-snug text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-[1.7] text-muted-foreground">
                {feature.body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
