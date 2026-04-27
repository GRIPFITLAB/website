import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/**
 * Visual reference: DESIGN_SYSTEM/ui_kits/website/HeroSection.jsx.
 *
 * Copy is *placeholder* per Decisions.md §16 Q5 — once a tagline lands
 * we'll replace these strings. The mock app card is intentionally a
 * stylized SVG, not a real `<Image>`, until brand photography lands.
 */
const stats: Array<[value: string, label: string]> = [
  ["±0.5 lbs", "Accuracy"],
  ["6h", "Battery"],
  ["< 3s", "BT pairing"],
  ["iOS 16+", "Compatible"],
];

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-5 py-20 md:px-8 md:py-28">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[10%] left-1/2 h-[500px] w-[700px] -translate-x-1/2 max-w-[140vw] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in oklab, var(--color-primary) 18%, transparent) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[5%] top-[20%] h-[400px] w-[400px] max-w-[60vw] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in oklab, var(--color-chart-5) 12%, transparent) 0%, transparent 65%)",
        }}
      />

      <div className="relative flex w-full max-w-5xl flex-col items-center gap-7 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.04em] text-primary">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-accent-glow)]"
          />
          Smart hand dynamometer · Pre-order open
        </span>

        <h1 className="text-balance font-display text-[clamp(40px,5.5vw,76px)] font-extrabold leading-[1.05] tracking-[-0.04em] text-foreground">
          Measure your grip.{" "}
          <span
            className="block"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent-strong) 0%, var(--color-primary) 40%, var(--color-chart-5) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Know your readiness.
          </span>
        </h1>

        <p className="max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          GripFit pairs a precision hand dynamometer with iOS to track peak
          force, endurance, and fatigue in real time — turning grip data into
          actionable readiness intelligence.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            render={<Link href={routes.product.href} />}
            size="lg"
            className="px-8 shadow-[0_0_36px_var(--color-accent-glow)]"
          >
            Pre-order GripFit
          </Button>
          <Button
            render={<Link href={routes.science.href} />}
            size="lg"
            variant="outline"
            className="px-8"
          >
            The science →
          </Button>
        </div>

        <HeroAppCard />

        <ul className="mt-2 flex flex-wrap justify-center gap-x-10 gap-y-4">
          {stats.map(([value, label]) => (
            <li key={label} className="text-center">
              <div className="font-display text-2xl font-bold tracking-tight text-foreground">
                {value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground/70">
                {label}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HeroAppCard() {
  return (
    <div
      className="mt-6 w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card/70 shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      style={{
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px color-mix(in oklab, var(--color-primary) 6%, transparent)",
      }}
      aria-label="GripFit iOS app preview"
    >
      <div className="flex justify-between border-b border-border/60 bg-background/50 px-5 py-2.5 text-[11px] font-medium text-muted-foreground">
        <span>9:41</span>
        <span>◉ Dashboard</span>
        <span>70%</span>
      </div>
      <div className="px-6 pb-6 pt-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
              Today&apos;s best
            </div>
            <div className="font-display text-4xl font-extrabold leading-none tracking-[-0.03em] text-foreground">
              84{" "}
              <span className="text-lg font-normal text-muted-foreground">
                lbs
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
              Readiness
            </div>
            <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="5"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="5"
                strokeDasharray="138.2"
                strokeDashoffset="13.8"
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
                style={{
                  filter:
                    "drop-shadow(0 0 6px color-mix(in oklab, var(--color-success) 60%, transparent))",
                }}
              />
              <text
                x="28"
                y="33"
                textAnchor="middle"
                fontSize="15"
                fontWeight="700"
                fill="var(--color-success)"
              >
                91
              </text>
            </svg>
          </div>
        </div>
        <svg
          width="100%"
          height="60"
          viewBox="0 0 552 60"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-chart-5)"
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor="var(--color-chart-5)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <path
            d="M0,55 C60,55 80,50 120,35 C160,20 190,5 220,2 C250,-1 280,15 310,30 C340,45 380,52 440,54 L552,55 Z"
            fill="url(#hero-fill)"
          />
          <path
            d="M0,55 C60,55 80,50 120,35 C160,20 190,5 220,2 C250,-1 280,15 310,30 C340,45 380,52 440,54"
            fill="none"
            stroke="var(--color-chart-5)"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
