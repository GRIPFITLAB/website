import type { Metadata } from "next";

import { Container } from "@/components/ui/section";
import { Display, Eyebrow, Lead } from "@/components/ui/typography";
import { externalLinks } from "@/lib/config";

export const metadata: Metadata = {
  title: "Setup",
  description: "How to charge, pair, and take your first measurement with GripFit.",
};

const steps: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Charge it",
    body: "Plug a USB-C cable into your GripFit. A full charge takes about 90 minutes and lasts ~30 days under normal use (passive sleep mode).",
  },
  {
    title: "Get the app",
    body: "Download GripFit from the App Store on iOS 17 or later. Open the app and tap 'sign up'. The app will request Bluetooth permissions — tap Allow.",
  },
  {
    title: "Pair it",
    body: "In the app, tap 'Scan for Devices' and select 'GripFit' from the list. You can rename it later.",
  },
  {
    title: "Squeeze",
    body: "Hold the device in either hand with a comfortable, full-palm grip. Select left or right hand toggle, and tap 'Start Test'. Squeeze with maximum force for 5 to 10 seconds. The force reading appears in real time. Repeat with the other hand to log a baseline.",
  },
  {
    title: "Build your baseline",
    body: "Take a measurement with each hand at the same time each day for at least 5 days. Your readiness score learns your baseline from there.",
  },
];

export default function SetupPage() {
  return (
    <Container className="max-w-4xl py-20 md:py-28">
      <Eyebrow className="mb-6">Setup guide</Eyebrow>
      <Display as="h1" size="xl">
        Up and running in five minutes.
      </Display>
      <Lead className="mt-6">
        These steps walk through unboxing, pairing, and your first measurement. Need help?{" "}
        <a
          href={`mailto:${externalLinks.supportEmail}`}
          className="text-accent-bright underline-offset-4 hover:underline"
        >
          {externalLinks.supportEmail}
        </a>
        .
      </Lead>

      <ol className="mt-16 flex flex-col">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="grid gap-6 border-t border-border-hairline py-10 md:grid-cols-12"
          >
            <span className="font-display text-[56px] font-medium leading-none tracking-[-0.025em] text-accent-bright tabular-nums md:col-span-2 md:text-[72px]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="md:col-span-10">
              <Display as="h2" size="md">
                {step.title}
              </Display>
              <p className="mt-3 max-w-2xl text-[16px] leading-[1.75] text-text-secondary">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Container>
  );
}
