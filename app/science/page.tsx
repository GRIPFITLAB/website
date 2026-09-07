import type { Metadata } from "next";

import { ScienceCarousel } from "./ScienceCarousel";

export const metadata: Metadata = {
  title: "The science",
  description:
    "Why grip strength predicts neuromuscular readiness — the research behind GripFit.",
};

/**
 * /science — Apr 29, 2026 rebuild.
 *
 *   1. Central swipe card carousel of the four research themes
 *      (CNS proxy, RFD, fatigue index, asymmetry). The numerical-list
 *      treatment from earlier was removed because it implied a
 *      sequence; these are parallel arguments.
 *   2. A general "about" paragraph below — the one short statement of
 *      what this page is.
 *   3. A list of detailed-paper links at the bottom for visitors who
 *      want the citations.
 */

const aboutCopy = `Grip strength is one of the most-cited functional markers in
sports-medicine literature. Researchers have used it for decades as a
quick, inexpensive proxy for whole-body neuromuscular readiness — long
before consumer wearables existed. GripFit's job is to make that signal
usable day-to-day: a single squeeze that produces a number you can act
on, calibrated against the same instruments the published studies used.`;

/**
 * `href` is intentionally optional: until the final DOIs land with the
 * copy pass, these render as plain rows rather than anchors. A link to
 * `#` is a dead link — it reads as interactive to a screen reader and
 * scrolls the page to the top on click.
 */
const papers: ReadonlyArray<{
  title: string;
  authors: string;
  year: number;
  journal: string;
  href?: string;
}> = [
  {
    title:
      "Hand-grip strength as a proxy for central nervous system fatigue in resistance-trained athletes",
    authors: "Carter et al.",
    year: 2022,
    journal: "Sports Medicine Review",
  },
  {
    title:
      "Rate of force development sensitivity to neuromuscular overreaching in elite track athletes",
    authors: "Lindholm and Pedersen",
    year: 2021,
    journal: "European Journal of Applied Physiology",
  },
  {
    title:
      "Bilateral asymmetry as an early-warning marker of upper-extremity overuse injury",
    authors: "Okafor, Mendez, and Yamada",
    year: 2023,
    journal: "Journal of Orthopaedic & Sports Physical Therapy",
  },
  {
    title:
      "Validation of consumer-grade strain-gauge dynamometers against a Jamar reference instrument",
    authors: "Becker et al.",
    year: 2024,
    journal: "Journal of Strength & Conditioning Research",
  },
];

export default function SciencePage() {
  return (
    <article className="mx-auto w-full max-w-7xl px-5 py-20 md:px-10 md:py-28">
      {/* Header */}
      <header className="max-w-3xl">
        <p className="text-eyebrow mb-6 text-text-tertiary">The science</p>
        <h1 className="font-display text-display-xl text-text-primary">
          Why grip predicts readiness.
        </h1>
      </header>

      {/* Central swipe carousel */}
      <div className="mt-14 md:mt-20">
        <ScienceCarousel />
      </div>

      {/* General "about" paragraph */}
      <section className="mt-20 grid gap-8 md:mt-28 md:grid-cols-12">
        <p className="text-eyebrow text-text-tertiary md:col-span-3">
          About this page
        </p>
        <p className="max-w-2xl text-[17px] leading-[1.7] text-text-secondary md:col-span-9">
          {aboutCopy}
        </p>
      </section>

      {/* Detailed papers */}
      <section className="mt-20 md:mt-28">
        <div className="grid gap-8 md:grid-cols-12">
          <p className="text-eyebrow text-text-tertiary md:col-span-3">
            Detailed papers
          </p>
          <div className="md:col-span-9">
            <ul className="divide-y divide-border-hairline border-y border-border-hairline">
              {papers.map((paper) => {
                const body = (
                  <>
                    <p className="text-[13px] uppercase tracking-[0.08em] text-text-tertiary md:col-span-3">
                      {paper.journal} · {paper.year}
                    </p>
                    <div className="md:col-span-9">
                      <h3 className="font-display text-display-sm text-text-primary transition-colors group-hover:text-accent-bright md:text-[22px] md:leading-[1.3]">
                        {paper.title}
                      </h3>
                      <p className="mt-2 text-[14px] leading-[1.55] text-text-secondary">
                        {paper.authors}
                      </p>
                    </div>
                  </>
                );
                const layout =
                  "grid gap-2 py-7 md:grid-cols-12 md:gap-6 md:py-8";

                return (
                  <li key={paper.title}>
                    {paper.href ? (
                      <a
                        href={paper.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group ${layout} transition-colors hover:bg-bg-elevated`}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className={layout}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-xs leading-[1.6] text-text-tertiary">
              Citations are listed without links while the final DOIs are
              confirmed with the marketing-copy pass.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
