import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { routes } from "@/lib/routes";

/**
 * Science — replaces WHOOP's "Backed by PhDs, worn by MVPs" social-proof
 * band on the home page. Decisions.md §6 explicitly excludes social
 * proof in v1, so the analogous visual slot is a research-citation
 * mosaic that argues for grip-as-readiness with numbers, not faces.
 *
 * Visual reference: WHOOP's PhDs-and-MVPs row, but the cards are
 * citations and stats instead of athlete portraits.
 */
const cards: ReadonlyArray<{
  stat: string;
  unit?: string;
  body: string;
  source: string;
}> = [
  {
    stat: "5–8",
    unit: "%",
    body: "Acute drop in peak grip force that reliably precedes neuromuscular underrecovery, before athletes report feeling fatigued.",
    source: "Sports Med Review · CNS fatigue markers",
  },
  {
    stat: "10–15",
    unit: "%",
    body: "L/R asymmetry threshold linked to elevated injury risk. Daily bilateral tracking catches drift before compensation patterns set in.",
    source: "J. Orthop. Sports Phys. Ther.",
  },
  {
    stat: ">2",
    unit: "× SD",
    body: "RFD changes precede peak-force changes by days, making rate-of-force-development the earliest objective overreaching signal.",
    source: "Eur. J. Appl. Physiol.",
  },
];

export function Science() {
  return (
    <section className="relative overflow-hidden border-y border-border-hairline bg-background py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/2 left-1/2 size-[800px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(91,33,182,0.06), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="mb-16 grid gap-8 md:mb-20 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="text-eyebrow mb-5 text-accent">
              Built on the research
            </p>
            <h2 className="font-display text-display-xl text-text-primary">
              Grip force is a published proxy for readiness.
            </h2>
          </div>
          <p className="max-w-md text-[17px] leading-[1.7] text-text-secondary md:col-span-5 md:col-start-8 md:self-end">
            We didn&apos;t invent grip-as-readiness — we built the
            instrument that finally makes the literature usable in
            day-to-day training.
          </p>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <li
              key={card.source}
              className="group relative flex flex-col rounded-xl border border-border-default bg-bg-elevated p-8 transition-shadow hover:shadow-[0_4px_16px_rgba(10,10,11,0.06)] md:p-10"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[72px] font-medium leading-none tracking-[-0.025em] text-accent tabular-nums md:text-[88px]">
                  {card.stat}
                </span>
                {card.unit ? (
                  <span className="font-display text-2xl font-medium text-accent">
                    {card.unit}
                  </span>
                ) : null}
              </div>

              <p className="mt-6 text-[15px] leading-[1.65] text-text-secondary">
                {card.body}
              </p>

              <p className="text-eyebrow mt-8 border-t border-border-hairline pt-5 text-text-tertiary">
                {card.source}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <Link
            href={routes.science.href}
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-accent transition-colors hover:text-accent-deep"
          >
            Read the full science page
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
