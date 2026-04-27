import Link from "next/link";

import { routes } from "@/lib/routes";

/**
 * Features — WHOOP "Get a complete picture of your health" pattern.
 *
 * One large featured card on top spanning full width (the "headline"
 * feature), then a 2x2 grid of smaller feature cards below. Each card
 * is a light off-white surface with an abstract purple-tinted graphic
 * (text-accent), a small eyebrow / large display H3 / short body.
 * Imagery is abstract SVG only — no photography, per design.md §9.
 */
type FeatureGraphic = "force-curve" | "asymmetry" | "ring" | "spark" | "device";

interface Feature {
  eyebrow: string;
  title: string;
  body: string;
  graphic: FeatureGraphic;
}

const headline: Feature = {
  eyebrow: "Real-time force",
  title: "See the curve, not just the number.",
  body: "Most dynamometers report a single peak number. GripFit streams 100 samples per second to your phone, so you see the full force curve — rise rate, plateau, and fatigue tail — every squeeze. That curve is what coaches actually act on.",
  graphic: "force-curve",
};

const features: ReadonlyArray<Feature> = [
  {
    eyebrow: "Bilateral",
    title: "Both hands, separately.",
    body: "Independent left/right tracking flags 10–15% asymmetries — the threshold at which injury risk climbs sharply.",
    graphic: "asymmetry",
  },
  {
    eyebrow: "Readiness",
    title: "One score, daily.",
    body: "Grip force compresses CNS fatigue, recovery, and load history into a single 0–100 readiness number you can actually use.",
    graphic: "ring",
  },
  {
    eyebrow: "Trends",
    title: "Built for the long run.",
    body: "Seven-day, 30-day, and seasonal trend views. Spot drift before it becomes regression; catch progress when it lands.",
    graphic: "spark",
  },
  {
    eyebrow: "Hardware",
    title: "Calibrated for life.",
    body: "Aluminium body, strain-gauge load cell, USB-C charging, ~6h continuous use, ±0.5 lbs accuracy across 0–150 lbs.",
    graphic: "device",
  },
];

export function Features() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="mb-16 max-w-3xl md:mb-20">
          <p className="text-eyebrow mb-5 text-accent">
            What you measure
          </p>
          <h2 className="font-display text-display-xl text-text-primary">
            Get a complete picture of your readiness.
          </h2>
        </div>

        {/* Headline feature — full-width tall card */}
        <FeatureCard feature={headline} variant="headline" className="mb-4" />

        {/* 2x2 grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        <p className="mt-12 text-sm text-text-tertiary">
          Want the research?{" "}
          <Link
            href={routes.science.href}
            className="text-accent underline-offset-4 hover:underline"
          >
            Read the science behind grip-as-readiness →
          </Link>
        </p>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  variant = "default",
  className,
}: {
  feature: Feature;
  variant?: "default" | "headline";
  className?: string;
}) {
  const isHeadline = variant === "headline";
  return (
    <article
      className={[
        "group relative overflow-hidden rounded-xl border border-border-default bg-bg-elevated transition-shadow hover:shadow-[0_4px_16px_rgba(10,10,11,0.06)]",
        isHeadline
          ? "grid md:grid-cols-2 md:min-h-[420px]"
          : "flex flex-col min-h-[360px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={
          isHeadline
            ? "flex flex-col justify-end p-8 md:p-12"
            : "flex flex-1 flex-col justify-end p-7 md:p-9"
        }
      >
        <p className="text-eyebrow mb-4 text-accent">{feature.eyebrow}</p>
        <h3
          className={
            isHeadline
              ? "font-display text-display-lg max-w-md text-text-primary"
              : "font-display text-display-md max-w-sm text-text-primary"
          }
        >
          {feature.title}
        </h3>
        <p
          className={
            isHeadline
              ? "mt-5 max-w-md text-[15px] leading-[1.7] text-text-secondary"
              : "mt-4 max-w-sm text-[15px] leading-[1.65] text-text-secondary"
          }
        >
          {feature.body}
        </p>
      </div>

      {/* Graphic well — light grey panel; SVGs use text-accent (purple). */}
      <div
        className={
          isHeadline
            ? "relative order-first border-b border-border-hairline bg-bg-deep md:order-last md:border-b-0 md:border-l"
            : "relative h-44 border-b border-border-hairline bg-bg-deep"
        }
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-purple-wash opacity-50"
        />
        <FeatureGraphicSvg name={feature.graphic} />
      </div>
    </article>
  );
}

/* ============================================================
   Per-feature abstract SVG graphics.
   All graphics use `currentColor` so the parent can tint via
   text-accent-* utilities. They're decorative, not data — each one
   echoes the metaphor of the feature without simulating an app screen.
   ============================================================ */
function FeatureGraphicSvg({ name }: { name: FeatureGraphic }) {
  switch (name) {
    case "force-curve":
      return (
        <svg
          viewBox="0 0 600 400"
          className="absolute inset-0 h-full w-full text-accent"
          aria-hidden
        >
          <defs>
            <linearGradient id="fc-fill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <line
              key={i}
              x1={i * 75}
              y1={20}
              x2={i * 75}
              y2={380}
              stroke="currentColor"
              strokeOpacity="0.06"
            />
          ))}
          <path
            d="M 0 380 L 60 380 L 110 320 L 170 80 L 240 35 L 320 50 L 400 95 L 480 175 L 560 270 L 600 320 L 600 400 L 0 400 Z"
            fill="url(#fc-fill)"
          />
          <path
            d="M 0 380 L 60 380 L 110 320 L 170 80 L 240 35 L 320 50 L 400 95 L 480 175 L 560 270 L 600 320"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="240" cy="35" r="5" fill="currentColor" />
          <circle cx="240" cy="35" r="12" fill="currentColor" fillOpacity="0.3" />
        </svg>
      );

    case "asymmetry":
      return (
        <svg
          viewBox="0 0 400 200"
          className="absolute inset-0 h-full w-full text-accent"
          aria-hidden
        >
          <rect x="40" y="60" width="14" height="100" rx="2" fill="currentColor" opacity="0.95" />
          <rect x="60" y="40" width="14" height="120" rx="2" fill="currentColor" opacity="0.95" />
          <rect x="80" y="55" width="14" height="105" rx="2" fill="currentColor" opacity="0.95" />
          <rect x="100" y="35" width="14" height="125" rx="2" fill="currentColor" />
          <rect x="120" y="48" width="14" height="112" rx="2" fill="currentColor" opacity="0.95" />

          <rect x="246" y="80" width="14" height="80" rx="2" fill="currentColor" opacity="0.45" />
          <rect x="266" y="68" width="14" height="92" rx="2" fill="currentColor" opacity="0.45" />
          <rect x="286" y="78" width="14" height="82" rx="2" fill="currentColor" opacity="0.45" />
          <rect x="306" y="62" width="14" height="98" rx="2" fill="currentColor" opacity="0.5" />
          <rect x="326" y="74" width="14" height="86" rx="2" fill="currentColor" opacity="0.45" />

          <text x="40" y="180" fill="currentColor" fontSize="11" fontWeight="700" letterSpacing="2" opacity="0.9">L</text>
          <text x="246" y="180" fill="currentColor" fontSize="11" fontWeight="700" letterSpacing="2" opacity="0.6">R</text>
          <line x1="180" y1="30" x2="180" y2="170" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="3 4" />
        </svg>
      );

    case "ring":
      return (
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 mx-auto h-full text-accent"
          aria-hidden
        >
          <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="10" />
          <circle
            cx="100"
            cy="100"
            r="62"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 62 * 0.86} ${2 * Math.PI * 62}`}
            transform="rotate(-90 100 100)"
          />
          <text
            x="100"
            y="106"
            textAnchor="middle"
            fill="currentColor"
            fontSize="40"
            fontWeight="800"
            letterSpacing="-1"
          >
            86
          </text>
          <text
            x="100"
            y="135"
            textAnchor="middle"
            fill="currentColor"
            fontSize="9"
            fontWeight="600"
            letterSpacing="2"
            opacity="0.6"
          >
            READY
          </text>
        </svg>
      );

    case "spark":
      return (
        <svg
          viewBox="0 0 600 200"
          className="absolute inset-0 h-full w-full text-accent"
          aria-hidden
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line
              key={i}
              x1={i * 100}
              y1={0}
              x2={i * 100}
              y2={200}
              stroke="currentColor"
              strokeOpacity="0.06"
            />
          ))}
          <path
            d="M 0 140 L 60 130 L 120 110 L 180 120 L 240 90 L 300 80 L 360 70 L 420 65 L 480 55 L 540 50 L 600 45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.5"
          />
          <path
            d="M 0 110 L 60 100 L 120 95 L 180 70 L 240 80 L 300 60 L 360 50 L 420 40 L 480 30 L 540 35 L 600 25"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="600" cy="25" r="4" fill="currentColor" />
        </svg>
      );

    case "device":
      return (
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 mx-auto h-full text-accent"
          aria-hidden
        >
          <rect x="60" y="40" width="80" height="120" rx="14" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
          <rect x="68" y="56" width="64" height="3" rx="1.5" fill="currentColor" opacity="0.85" />
          <rect x="68" y="68" width="64" height="3" rx="1.5" fill="currentColor" opacity="0.6" />
          <rect x="68" y="80" width="44" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="100" cy="135" r="14" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
          <circle cx="100" cy="135" r="4" fill="currentColor" />
          <path d="M 145 100 Q 165 100 145 130" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 152 90 Q 178 100 152 140" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
  }
}
