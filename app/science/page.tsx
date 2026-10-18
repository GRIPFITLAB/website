import type { Metadata } from "next";

import { ScienceCarousel } from "./ScienceCarousel";

export const metadata: Metadata = {
  title: "The research",
  description:
    "What your grip is telling you — the peer-reviewed research behind GripFit.",
};

/**
 * /science — Apr 29, 2026 rebuild.
 *
 *   1. Central swipe card carousel of the four research themes
 *      (longevity, asymmetry, fatigue & recovery, RFD). The
 *      numerical-list treatment from earlier was removed because it
 *      implied a sequence; these are parallel arguments.
 *   2. A general "about" paragraph below — the one short statement of
 *      what this page is.
 *   3. A list of detailed-paper links at the bottom for visitors who
 *      want the citations.
 */

const aboutCopy = `Grip strength is one of the most-studied functional markers in
medical and sports research. Researchers have used it for decades as a
quick, inexpensive measure of overall strength and long-term health.
GripFit's job is to make that signal usable day-to-day: a single squeeze,
logged against your own baseline, with the full force curve that
traditional dynamometers can't capture.`;

const papers: ReadonlyArray<{
  title: string;
  year: number;
  journal: string;
  doi: string;
}> = [
  {
    title:
      "Prognostic value of grip strength: findings from the Prospective Urban Rural Epidemiology (PURE) study",
    year: 2015,
    journal: "The Lancet",
    doi: "10.1016/S0140-6736(14)62000-6",
  },
  {
    title:
      "Handgrip strength asymmetry and weakness together are associated with functional disability in aging Americans",
    year: 2021,
    journal: "Journals of Gerontology: Series A",
    doi: "10.1093/gerona/glaa100",
  },
  {
    title:
      "Handgrip strength asymmetry is associated with slow gait speed and poorer standing balance in older Americans",
    year: 2022,
    journal: "Archives of Gerontology and Geriatrics",
    doi: "10.1016/j.archger.2022.104716",
  },
  {
    title:
      "Fatigue and recovery assessed by repetitive handgrip strength measurement as predictors of fall risk in older adults",
    year: 2025,
    journal: "Clinical Rehabilitation",
    doi: "10.1177/02692155251355881",
  },
  {
    title:
      "Exploratory associations between handgrip strength, fatigue state, and cycling performance in trained cyclists",
    year: 2026,
    journal: "Sports",
    doi: "10.3390/sports14100423",
  },
  {
    title:
      "Handgrip explosive force is correlated with mobility in the elderly women",
    year: 2015,
    journal: "Acta of Bioengineering and Biomechanics",
    doi: "10.5277/ABB-00124-2014-03",
  },
  {
    title:
      "Validating the capability for measuring age-related changes in grip-force strength using a digital hand-held dynamometer",
    year: 2020,
    journal: "BioMed Research International",
    doi: "10.1155/2020/6936879",
  },
];

export default function SciencePage() {
  return (
    <article className="mx-auto w-full max-w-7xl px-5 py-20 md:px-10 md:py-28">
      {/* Header */}
      <header className="max-w-3xl">
        <p className="text-eyebrow mb-6 text-text-tertiary">The research</p>
        <h1 className="font-display text-display-xl text-text-primary">
          What your grip is telling you.
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
              {papers.map((paper) => (
                <li key={paper.doi}>
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid gap-2 py-7 transition-colors hover:bg-bg-elevated md:grid-cols-12 md:gap-6 md:py-8"
                  >
                    <p className="text-[13px] uppercase tracking-[0.08em] text-text-tertiary md:col-span-3">
                      {paper.journal} · {paper.year}
                    </p>
                    <div className="md:col-span-9">
                      <h3 className="font-display text-display-sm text-text-primary transition-colors group-hover:text-accent-bright md:text-[22px] md:leading-[1.3]">
                        {paper.title}
                      </h3>
                      <p className="mt-2 break-all text-[14px] leading-[1.55] text-text-secondary">
                        DOI: {paper.doi}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-[1.6] text-text-tertiary">
              Each DOI links to the original peer-reviewed publication.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
