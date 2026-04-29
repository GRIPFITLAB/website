/**
 * Readiness — replaces the deleted 3-step HowItWorks rail (Apr 29,
 * 2026 revamp). Same conceptual job (explain how the device produces
 * a readiness score) but expressed as benefit cards instead of a
 * sequential numbered list.
 *
 * Visual: a 4-card grid on a slightly raised cream surface. Each card
 * has an eyebrow, a short headline, a paragraph, and a small abstract
 * SVG glyph in the upper-right corner. The first card spans wider on
 * desktop to give the section a "hero benefit" anchor.
 */

import { Activity, Gauge, ListChecks, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ReadinessCard {
  eyebrow: string;
  title: string;
  body: string;
  icon: LucideIcon;
  /** Spans 2 grid columns on desktop. */
  wide?: boolean;
}

const cards: ReadonlyArray<ReadinessCard> = [
  {
    eyebrow: "What it measures",
    title: "Grip force, sampled 100 times a second.",
    body: "A strain-gauge load cell streams a high-resolution force curve, not a single peak. We capture rise rate, plateau height, hold time, and fatigue tail — the shape of the squeeze, not just the score.",
    icon: Gauge,
    wide: true,
  },
  {
    eyebrow: "Daily score",
    title: "Compressed into one readiness number.",
    body: "Peak force, rate-of-force-development, and bilateral balance roll up into a 0–100 readiness score that fits next to your sleep and load metrics.",
    icon: Activity,
  },
  {
    eyebrow: "Patterns",
    title: "Trends pick up drift before you do.",
    body: "Seven-day, 30-day, and seasonal views surface fatigue accumulation 2–4 days before perceived exertion catches up — when there's still time to deload.",
    icon: ListChecks,
  },
  {
    eyebrow: "Effort",
    title: "Two squeezes. Under thirty seconds.",
    body: "Pair once, then it's a glance-and-go: open the app, squeeze each hand, get your number. The math runs on the phone, not on you.",
    icon: Wand2,
  },
];

export function Readiness() {
  return (
    <section className="bg-bg-raised py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="mb-14 grid gap-8 md:mb-20 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-eyebrow mb-5 text-text-tertiary">
              Readiness, decoded
            </p>
            <h2 className="font-display text-display-xl text-text-primary">
              The number you train against — explained.
            </h2>
          </div>
          <p className="max-w-md text-[17px] leading-[1.7] text-text-secondary md:col-span-4 md:col-start-9 md:self-end">
            Most readiness scores hide their math. GripFit shows yours,
            built from one signal that's measurable, repeatable, and
            recognised in the literature: grip force.
          </p>
        </div>

        <ul className="grid gap-4 md:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <li
                key={card.title}
                className={[
                  "group relative flex flex-col rounded-2xl border border-border-default bg-bg-elevated p-7 transition-shadow hover:shadow-[var(--shadow-card-hover)] md:p-9",
                  card.wide ? "md:col-span-2" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="mb-7 inline-flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="size-5" strokeWidth={1.5} />
                </div>
                <p className="text-eyebrow mb-3 text-text-tertiary">
                  {card.eyebrow}
                </p>
                <h3 className="font-display text-display-md text-text-primary">
                  {card.title}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.65] text-text-secondary">
                  {card.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
