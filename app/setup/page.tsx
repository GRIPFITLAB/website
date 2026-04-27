import type { Metadata } from "next";

import { externalLinks } from "@/lib/config";

export const metadata: Metadata = {
  title: "Setup",
  description: "How to pair your GripFit device with the iOS app.",
};

const steps = [
  {
    n: 1,
    title: "Charge the device",
    body: "Plug the included USB-C cable into the side of your GripFit. The status LED pulses violet while charging and turns solid when full. A full charge takes about 45 minutes and lasts ~6 hours of active use.",
  },
  {
    n: 2,
    title: "Install the GripFit app",
    body: "Download GripFit from the App Store on iOS 16 or later. Open the app and tap Get started. The app will request Bluetooth permissions — tap Allow.",
  },
  {
    n: 3,
    title: "Power on and pair",
    body: "Press and hold the button on the device until the LED begins pulsing slowly. In the app, tap Add device and select GripFit from the list. Pairing typically completes in under three seconds.",
  },
  {
    n: 4,
    title: "Take your first measurement",
    body: "Hold the device in either hand with a comfortable, full-palm grip. Squeeze with maximum force for 5 to 10 seconds. The force curve appears in real time. Repeat with the other hand to log a baseline.",
  },
  {
    n: 5,
    title: "Build your baseline",
    body: "Take a single bilateral measurement at the same time each day for at least seven days. The app needs that window to compute your individualized readiness score and flag meaningful changes.",
  },
];

export default function SetupPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
        Setup guide
      </div>
      <h1 className="mb-4 font-display text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.1] tracking-[-0.04em] text-foreground">
        Get up and running in five minutes.
      </h1>
      <p className="mb-12 max-w-xl text-muted-foreground">
        These steps walk through unboxing, pairing, and your first measurement.
        Need help?{" "}
        <a
          href={`mailto:${externalLinks.supportEmail}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          {externalLinks.supportEmail}
        </a>
        .
      </p>

      <ol className="flex flex-col gap-8">
        {steps.map((step) => (
          <li key={step.n} className="flex gap-5">
            <span
              aria-hidden
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-display text-sm font-bold text-primary"
            >
              {step.n}
            </span>
            <div>
              <h2 className="mb-1.5 font-display text-lg font-bold text-foreground">
                {step.title}
              </h2>
              <p className="text-[15px] leading-[1.75] text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground/60">
        Setup copy is placeholder — final wording will be aligned with the
        in-app onboarding once the iOS app is locked.
      </p>
    </article>
  );
}
