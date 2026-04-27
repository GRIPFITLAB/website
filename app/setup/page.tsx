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
    body: "Plug the included USB-C cable into the side of your GripFit. The status LED pulses amber while charging and turns solid when full. A full charge takes about 45 minutes and lasts ~6 hours of active use.",
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
    <article className="mx-auto w-full max-w-4xl px-5 py-20 md:px-10 md:py-28">
      <p className="text-eyebrow mb-6 text-accent">Setup guide</p>
      <h1 className="font-display text-display-xl text-text-primary">
        Up and running in five minutes.
      </h1>
      <p className="mt-6 max-w-xl text-[17px] leading-[1.7] text-text-secondary">
        These steps walk through unboxing, pairing, and your first
        measurement. Stuck anywhere?{" "}
        <a
          href={`mailto:${externalLinks.supportEmail}`}
          className="text-accent underline-offset-4 hover:underline"
        >
          {externalLinks.supportEmail}
        </a>
        .
      </p>

      <ol className="mt-16 flex flex-col">
        {steps.map((step) => (
          <li
            key={step.n}
            className="grid gap-6 border-t border-border-hairline py-10 md:grid-cols-12"
          >
            <span className="font-display text-[56px] font-medium leading-none tracking-[-0.025em] text-accent tabular-nums md:col-span-2 md:text-[72px]">
              {String(step.n).padStart(2, "0")}
            </span>
            <div className="md:col-span-10">
              <h2 className="font-display text-display-md text-text-primary">
                {step.title}
              </h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-[1.75] text-text-secondary">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-12 border-t border-border-hairline pt-6 text-xs leading-[1.6] text-text-tertiary">
        Setup copy is placeholder — final wording will be aligned with the
        in-app onboarding once the iOS app is locked.
      </p>
    </article>
  );
}
