import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The science",
  description:
    "Why grip strength predicts neuromuscular readiness — the research behind GripFit.",
};

const items = [
  {
    title: "Grip strength as a CNS proxy",
    body: "Research shows grip force correlates with central nervous system fatigue. A drop of 5–8% in peak grip reliably predicts compromised neuromuscular readiness before subjective fatigue is perceived.",
  },
  {
    title: "Rate of force development",
    body: "RFD — how quickly you reach peak force — is sensitive to fatigue state before peak force itself changes, making it an early-warning signal for overreaching.",
  },
  {
    title: "Fatigue index",
    body: "GripFit calculates the force drop over a sustained grip. Higher fatigue index = greater glycolytic fatigue, helping coaches manage athlete load with objective data.",
  },
  {
    title: "Asymmetry detection",
    body: "L/R asymmetries greater than 10–15% are linked to injury risk. Daily bilateral tracking catches developing imbalances early, before they become problems.",
  },
];

export default function SciencePage() {
  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-20 md:px-10 md:py-28">
      <p className="text-eyebrow mb-6 text-accent-bright">The science</p>
      <h1 className="font-display text-display-xl mb-16 text-text-primary">
        Why grip predicts readiness.
      </h1>

      <div className="flex flex-col gap-12">
        {items.map((item, index) => (
          <section
            key={item.title}
            className="grid gap-6 border-t border-border-hairline pt-10 md:grid-cols-12"
          >
            <span className="text-eyebrow text-text-tertiary tabular-nums md:col-span-2">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="md:col-span-10">
              <h2 className="font-display text-display-md text-text-primary">
                {item.title}
              </h2>
              <p className="mt-4 max-w-2xl text-[17px] leading-[1.75] text-text-secondary">
                {item.body}
              </p>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-16 border-t border-border-hairline pt-6 text-xs leading-[1.6] text-text-tertiary">
        Long-form citations — TODO. Decisions.md §15 Step 8 owns the
        copywriting + reference pass for this page.
      </p>
    </article>
  );
}
