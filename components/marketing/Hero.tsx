import Link from "next/link";

import { Button } from "@/components/ui/button";
import { productConfig } from "@/lib/config";
import { routes } from "@/lib/routes";

/**
 * Hero — light editorial section in the WHOOP-thin mould.
 *
 * Composition:
 *   - White canvas with a subtle purple radial wash bottom-center.
 *   - Single-eyebrow / massive thin display H1 / short body / two CTAs.
 *   - Stat strip across the bottom acts as the "compass" that orients
 *     the visitor on the device's spec story before they scroll.
 *   - Decorative force-curve SVG in the top-right corner echoes the
 *     measurement metaphor without simulating an app screen.
 *
 * Copy follows Decisions.md §16 Q5 placeholder direction
 * ("Force is data."). Replace once final tagline is locked.
 */
const stats: ReadonlyArray<{ value: string; label: string }> = [
  { value: "±0.5", label: "lbs accuracy" },
  { value: "100", label: "Hz sampling" },
  { value: "<3s", label: "BT pairing" },
  { value: "6h", label: "battery" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background layers — subtle purple wash + faint noise. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-purple-wash opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[40%] left-1/2 h-[700px] w-[1200px] max-w-[180vw] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(91, 33, 182, 0.10) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
      />

      {/* Decorative force-curve glyph */}
      <ForceCurve className="pointer-events-none absolute right-[-4%] top-[18%] hidden w-[44%] max-w-[640px] text-accent/25 lg:block" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start justify-center px-5 pb-24 pt-28 md:px-10 md:pb-32 md:pt-40 lg:min-h-[88vh]">
        <span className="text-eyebrow mb-8 inline-flex items-center gap-3 text-accent">
          <span
            aria-hidden
            className="inline-block size-1.5 rounded-full bg-accent"
          />
          Pre-order open · ${productConfig.base.fallbackPriceUSD}
        </span>

        <h1 className="font-display text-text-primary text-display-2xl max-w-[15ch]">
          Force is data.
        </h1>

        <p className="mt-7 max-w-xl text-balance text-[17px] leading-[1.7] text-text-secondary md:text-[19px]">
          GripFit measures every squeeze with strain-gauge precision and
          turns it into the readiness intelligence elite athletes use to
          plan, train, and recover.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button
            render={<Link href={routes.product.href} />}
            size="lg"
            className="h-12 px-8 text-sm font-semibold uppercase tracking-[0.08em] hover:shadow-[var(--shadow-glow)]"
          >
            Pre-order now
          </Button>
          <Button
            render={<Link href={routes.science.href} />}
            variant="outline"
            size="lg"
            className="h-12 border-border-strong bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.08em] text-text-primary hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            The science
          </Button>
        </div>

        <ul className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-y-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label}>
              <div className="font-display text-[44px] font-medium leading-none tracking-[-0.025em] text-text-primary tabular-nums sm:text-[56px]">
                {stat.value}
              </div>
              <div className="text-eyebrow mt-3 text-text-tertiary">
                {stat.label}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ForceCurve({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="hero-curve" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line
          key={i}
          x1={i * 75}
          y1={20}
          x2={i * 75}
          y2={380}
          stroke="currentColor"
          strokeOpacity="0.1"
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={i}
          x1={0}
          y1={20 + i * 72}
          x2={600}
          y2={20 + i * 72}
          stroke="currentColor"
          strokeOpacity="0.08"
        />
      ))}
      <path
        d="M 0 380 L 70 380 L 110 320 L 160 110 L 220 50 L 290 60 L 360 90 L 430 140 L 500 220 L 600 290"
        stroke="url(#hero-curve)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="220" cy="50" r="6" fill="currentColor" />
      <circle cx="220" cy="50" r="14" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}
