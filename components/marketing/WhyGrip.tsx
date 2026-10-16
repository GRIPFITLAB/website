import Link from "next/link";

import { Container, Section, SectionHeader } from "@/components/ui/section";
import { Display } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

/**
 * WhyGrip — why grip strength is the signal worth measuring. Replaces the
 * old "Features" card grid (Oct 15, 2026). Editorial layout: a big
 * statement, then three numbered arguments as a hairline list. No cards.
 *
 * The one statistic cited is Leong et al., The Lancet (2015) — the PURE
 * study — see /science for the reference.
 */
const points: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Readiness from output, not inference.",
    body: "HRV guesses recovery from your heartbeat. Grip measures what your nervous system can actually produce today, in one five-second effort, before you train.",
  },
  {
    title: "A clinically backed marker, not a fitness gimmick.",
    body: "Clinicians use grip strength to track recovery after injury and surgery, and researchers use it to predict long-term health. Each drop of 5 kg in grip strength was linked to a 16% higher risk of death from any cause in a study of nearly 140,000 adults.",
  },
  {
    title: "Precise enough to trust the trend.",
    body: "NIST-traceable load cells make the small day-to-day changes real. That's what turns a number into a trend, and a trend into a decision: push or recover.",
  },
];

export function WhyGrip() {
  return (
    <Section tone="deep" aria-labelledby="why-heading">
      <Container>
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <SectionHeader
              eyebrow="Why grip"
              title={<span id="why-heading">The strongest signal you aren&apos;t tracking.</span>}
              lead="Grip strength is a clinically backed marker for longevity and overall fitness. GripFit turns it into a daily readiness read."
            />
            <Link
              href={routes.science.href}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent-bright underline-offset-4 hover:underline"
            >
              Read the research →
            </Link>
          </div>

          <ol className="border-t border-border-hairline md:col-span-7">
            {points.map((point, i) => (
              <li
                key={point.title}
                className="grid grid-cols-[48px_1fr] gap-6 border-b border-border-hairline py-8 md:grid-cols-[72px_1fr]"
              >
                <span className="font-display text-display-sm tabular-nums text-text-tertiary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <Display as="h3" size="sm">
                    {point.title}
                  </Display>
                  <p className="mt-3 max-w-prose text-[16px] leading-[1.7] text-text-secondary">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
