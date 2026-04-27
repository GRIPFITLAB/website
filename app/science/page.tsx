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
    <article className="mx-auto w-full max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
        The science
      </div>
      <h1 className="mb-12 font-display text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.1] tracking-[-0.04em] text-foreground">
        Why grip predicts readiness.
      </h1>

      <div className="flex flex-col gap-9">
        {items.map((item) => (
          <section
            key={item.title}
            className="border-l-2 border-primary/40 pl-6"
          >
            <h2 className="mb-2.5 font-display text-lg font-bold text-foreground">
              {item.title}
            </h2>
            <p className="text-[15px] leading-[1.8] text-muted-foreground">
              {item.body}
            </p>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground/60">
        Citations and full references — TODO. Decisions.md §16 Q1 lists this
        page as in-scope; long-form research notes are placeholder until the
        copywriting pass.
      </p>
    </article>
  );
}
