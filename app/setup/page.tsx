import type { Metadata } from "next";

import { Container } from "@/components/ui/section";
import { Display, Eyebrow, Lead } from "@/components/ui/typography";
import { externalLinks } from "@/lib/config";

export const metadata: Metadata = {
  title: "Setup",
  description: "How to charge, pair, and take your first measurement with GripFit.",
};

/**
 * Setup — five steps laid out as a horizontal strip on desktop so the whole
 * guide fits in one viewport; stacks into a numbered list on phones.
 */
const steps: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Charge it",
    body: "Plug in a USB-C cable. A full charge takes about 90 minutes and lasts about 20 days under normal use (passive sleep mode).",
  },
  {
    title: "Get the app",
    body: "Download GripFit from the App Store on iOS 17 or later. Open it, tap 'sign up', and tap Allow when it asks for Bluetooth.",
  },
  {
    title: "Pair it",
    body: "Tap 'Scan for Devices' and select 'GripFit' from the list. You can rename it later.",
  },
  {
    title: "Squeeze",
    body: "Full-palm grip, pick left or right, tap 'Start Test'. Squeeze as hard as you can for 5–10 seconds — the force reads live. Repeat with the other hand.",
  },
  {
    title: "Build your baseline",
    body: "One measurement per hand, same time each day, for at least 5 days. Your readiness score learns your baseline from there.",
  },
];

export default function SetupPage() {
  return (
    <Container className="flex min-h-[calc(100vh-5rem)] flex-col justify-center py-16 md:py-20">
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <Eyebrow className="mb-5">Setup guide</Eyebrow>
          <Display as="h1" size="xl">
            Up and running in five minutes.
          </Display>
        </div>
        <Lead size="md" className="md:col-span-5 md:max-w-none md:pb-2">
          Unboxing, pairing, and your first measurement. Need help?{" "}
          <a
            href={`mailto:${externalLinks.supportEmail}`}
            className="text-accent-bright underline-offset-4 hover:underline"
          >
            {externalLinks.supportEmail}
          </a>
          .
        </Lead>
      </div>

      <ol className="relative mt-14 grid gap-10 md:mt-20 md:grid-cols-5 md:gap-0">
        {/* Connecting rail (desktop only) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-[7px] hidden h-px bg-border-hairline md:block"
        />
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="relative grid grid-cols-[28px_1fr] gap-5 md:block md:pr-8 md:last:pr-0"
          >
            <span
              aria-hidden
              className="relative z-10 mt-1 block size-[15px] rounded-full border-2 border-accent bg-bg-canvas md:mt-0"
            />
            <div className="md:mt-7">
              <p className="text-eyebrow text-accent-bright">
                Step {String(i + 1).padStart(2, "0")}
              </p>
              <Display as="h2" size="sm" className="mt-3">
                {step.title}
              </Display>
              <p className="mt-3 text-[15px] leading-[1.65] text-text-secondary">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Container>
  );
}
