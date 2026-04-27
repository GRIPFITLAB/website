import type { Metadata } from "next";

import { externalLinks, siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `Terms of service for ${siteConfig.name}.`,
};

const updated = "April 26, 2026";

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
        Terms
      </div>
      <h1 className="mb-2 font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.1] tracking-[-0.04em] text-foreground">
        Terms of service
      </h1>
      <p className="mb-10 text-sm text-muted-foreground/70">
        Last updated {updated}
      </p>

      <div className="flex flex-col gap-8 text-[15px] leading-[1.8] text-muted-foreground">
        <Section title="Overview">
          <p>
            This is a placeholder terms-of-service document. The text below
            is{" "}
            <strong className="text-foreground">not legal advice</strong> and
            will be replaced with reviewed copy before {siteConfig.name}{" "}
            ships.
          </p>
        </Section>

        <Section title="Pre-orders">
          <p>
            By placing a pre-order you authorize us, via Shopify, to charge
            your selected payment method when your unit ships. You can cancel
            your pre-order any time before shipment for a full refund by
            emailing{" "}
            <a
              href={`mailto:${externalLinks.supportEmail}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {externalLinks.supportEmail}
            </a>
            .
          </p>
        </Section>

        <Section title="Returns">
          <p>
            Once your unit has shipped, returns are accepted within 30 days of
            delivery for unused devices in their original packaging.
          </p>
        </Section>

        <Section title="Warranty">
          <p>
            {siteConfig.name} hardware is covered by a one-year limited
            warranty against manufacturing defects. The warranty does not
            cover damage from misuse, drops, or unauthorized modification.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            {siteConfig.name} is a measurement device intended for tracking
            personal performance. It is not a medical device and is not
            intended to diagnose, treat, cure, or prevent any disease. Consult
            a qualified professional before making changes to your training
            program based on data from this product.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? Email{" "}
            <a
              href={`mailto:${externalLinks.supportEmail}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {externalLinks.supportEmail}
            </a>
            .
          </p>
        </Section>
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-bold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
