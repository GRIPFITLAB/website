import { Check, Minus } from "lucide-react";

import { Container, Section, SectionHeader } from "@/components/ui/section";
import { Eyebrow } from "@/components/ui/typography";

/**
 * Comparison — GripFit vs a standard dynamometer, on the blue band.
 * Four rows. Check vs minus glyphs in white.
 */
const rows: ReadonlyArray<{ label: string; gripfit: boolean; standard: boolean }> = [
  { label: "Bluetooth pairing", gripfit: true, standard: false },
  { label: "App-enabled readiness", gripfit: true, standard: false },
  { label: "Trend tracking", gripfit: true, standard: false },
  { label: "Bilateral balance", gripfit: true, standard: false },
];

export function Comparison() {
  return (
    <Section tone="inverted" aria-labelledby="comparison-heading">
      <Container>
        <SectionHeader
          onInk
          eyebrow="GripFit vs a standard dynamometer"
          title={<span id="comparison-heading">Same squeeze. Smarter answer.</span>}
          lead="The GripFit app on your iPhone tells you whether to push or recover."
          className="mb-12 md:mb-16"
        />

        <div className="overflow-hidden rounded-2xl border border-border-on-ink bg-black/15">
          <div className="grid grid-cols-[1fr_auto_auto] items-end gap-4 border-b border-border-on-ink px-6 py-5 md:grid-cols-[1fr_160px_160px] md:px-10 md:py-6">
            <Eyebrow onInk>Capability</Eyebrow>
            <Eyebrow className="text-right text-text-on-ink">GripFit</Eyebrow>
            <Eyebrow onInk className="text-right">
              Standard
            </Eyebrow>
          </div>
          <ul className="divide-y divide-border-on-ink">
            {rows.map((row) => (
              <li
                key={row.label}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-5 md:grid-cols-[1fr_160px_160px] md:px-10 md:py-6"
              >
                <p className="font-display text-display-sm text-text-on-ink">{row.label}</p>
                <div className="flex justify-end">
                  <YesNo yes={row.gripfit} />
                </div>
                <div className="flex justify-end">
                  <YesNo yes={row.standard} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

function YesNo({ yes }: { yes: boolean }) {
  return (
    <span
      aria-label={yes ? "Yes" : "No"}
      className={
        yes
          ? "inline-flex size-9 items-center justify-center rounded-full bg-white text-bg-ink"
          : "inline-flex size-9 items-center justify-center rounded-full border border-border-on-ink text-text-on-ink-tertiary"
      }
    >
      {yes ? (
        <Check className="size-4" strokeWidth={2.5} />
      ) : (
        <Minus className="size-4" strokeWidth={1.5} />
      )}
    </span>
  );
}
