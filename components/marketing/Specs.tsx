import { Container, Section, SectionHeader } from "@/components/ui/section";

/**
 * Specs — compact specification strip, placed before the comparison band.
 * Replaces the deleted /product page (Oct 15, 2026).
 */
const specs: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Force range", value: "0–300 lbs (0–1300 N)" },
  { label: "Connection", value: "Bluetooth" },
  { label: "Compatibility", value: "iOS 17 or later" },
  { label: "Battery", value: "20 days" },
  { label: "Charging", value: "USB-C · 90 minutes" },
];

export function Specs() {
  return (
    <Section rhythm="tight" aria-labelledby="specs-heading">
      <Container>
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <SectionHeader
              eyebrow="Specifications"
              title={<span id="specs-heading">A device you&apos;ll actually use.</span>}
              size="lg"
            />
          </div>
          <dl className="grid gap-x-10 border-t border-border-hairline md:col-span-8 md:grid-cols-2">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between gap-6 border-b border-border-hairline py-5"
              >
                <dt className="text-[13px] uppercase tracking-[0.08em] text-text-tertiary">
                  {spec.label}
                </dt>
                <dd className="text-right text-[15px] font-medium text-text-primary tabular-nums md:text-[16px]">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}
