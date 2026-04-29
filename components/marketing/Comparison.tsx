import { Check, Minus } from "lucide-react";

/**
 * Comparison — feature matrix pitting GripFit against a generic
 * "standard dynamometer". Replaces the home-page `Science` section
 * (Apr 29, 2026 revamp). Lives on a `bg-inverted` warm-charcoal band
 * so it reads as the section that pivots the visitor from "what it
 * does" → "what makes it different."
 *
 * Rows match the brief:
 *   - Bluetooth
 *   - App-enabled readiness
 *   - Trend tracking
 *   - Fatigue index
 *   - Bilateral balance
 *
 * Yes/no glyphs are simple cream check vs hairline minus — no green/red
 * semaphore.
 */

interface Row {
  label: string;
  detail: string;
  gripfit: boolean;
  standard: boolean;
}

const rows: ReadonlyArray<Row> = [
  {
    label: "Bluetooth pairing",
    detail: "Sub-3-second handshake, BLE 5.2",
    gripfit: true,
    standard: false,
  },
  {
    label: "App-enabled readiness",
    detail: "0–100 score from grip, sleep, and load",
    gripfit: true,
    standard: false,
  },
  {
    label: "Trend tracking",
    detail: "7-day, 30-day, seasonal views",
    gripfit: true,
    standard: false,
  },
  {
    label: "Fatigue index",
    detail: "Force-drop over hold, % from baseline",
    gripfit: true,
    standard: false,
  },
  {
    label: "Bilateral balance",
    detail: "L/R asymmetry to ±0.5 lbs",
    gripfit: true,
    standard: false,
  },
];

export function Comparison() {
  return (
    <section className="bg-inverted relative overflow-hidden py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-text-on-ink/15 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-text-on-ink/15 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="mb-14 grid gap-8 md:mb-20 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-eyebrow mb-5 text-text-on-ink-tertiary">
              GripFit vs the rest
            </p>
            <h2 className="font-display text-display-xl text-text-on-ink">
              A dynamometer that talks to your phone.
            </h2>
          </div>
          <p className="max-w-md text-[17px] leading-[1.7] text-text-on-ink-secondary md:col-span-4 md:col-start-9 md:self-end">
            Every standard hand dynamometer can give you a peak number.
            None of them turn that number into a readiness signal.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border-on-ink bg-bg-ink-elevated">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto] items-end gap-4 border-b border-border-on-ink px-6 py-6 text-text-on-ink-tertiary md:grid-cols-[1fr_140px_140px] md:px-10 md:py-8">
            <span className="text-eyebrow">Capability</span>
            <span className="text-eyebrow text-right text-text-on-ink">
              GripFit
            </span>
            <span className="text-eyebrow text-right">
              Standard dynamometer
            </span>
          </div>

          <ul className="divide-y divide-border-on-ink">
            {rows.map((row) => (
              <li
                key={row.label}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-6 md:grid-cols-[1fr_140px_140px] md:px-10 md:py-8"
              >
                <div className="min-w-0">
                  <p className="font-display text-display-sm text-text-on-ink">
                    {row.label}
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.55] text-text-on-ink-secondary">
                    {row.detail}
                  </p>
                </div>
                <div className="flex justify-end">
                  <YesNoCell yes={row.gripfit} variant="positive" />
                </div>
                <div className="flex justify-end">
                  <YesNoCell yes={row.standard} variant="muted" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 max-w-xl text-[14px] leading-[1.6] text-text-on-ink-tertiary">
          &ldquo;Standard dynamometer&rdquo; comparison reflects typical
          mid-range hydraulic and digital dynamometers used in clinical
          and athletic settings as of 2026.
        </p>
      </div>
    </section>
  );
}

function YesNoCell({
  yes,
  variant,
}: {
  yes: boolean;
  variant: "positive" | "muted";
}) {
  if (yes) {
    return (
      <span
        aria-label="Yes"
        className={[
          "inline-flex size-9 items-center justify-center rounded-full border",
          variant === "positive"
            ? "border-text-on-ink/30 bg-text-on-ink/10 text-text-on-ink"
            : "border-border-on-ink bg-transparent text-text-on-ink-tertiary",
        ].join(" ")}
      >
        <Check className="size-4" strokeWidth={2.25} />
      </span>
    );
  }
  return (
    <span
      aria-label="No"
      className="inline-flex size-9 items-center justify-center rounded-full border border-border-on-ink bg-transparent text-text-on-ink-tertiary"
    >
      <Minus className="size-4" strokeWidth={1.5} />
    </span>
  );
}
