import type { Metadata } from "next";

import { externalLinks, siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `Terms of service for ${siteConfig.name}.`,
};

const updated = "September 8, 2026";

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-20 md:px-10 md:py-28">
      <p className="text-eyebrow mb-6 text-text-tertiary">Terms</p>
      <h1 className="font-display text-display-xl text-text-primary">
        Terms of service
      </h1>
      <p className="mt-6 text-sm text-text-tertiary">
        Last updated {updated}
      </p>

      <div className="mt-14 flex flex-col gap-10 text-[16px] leading-[1.8] text-text-secondary">
        <Section title="Overview">
          <p>
            These terms describe how {siteConfig.name} operates today: no
            payment is taken on this site, and pre-orders run through a
            crowdfunding campaign. The text is{" "}
            <strong className="text-text-primary">
              not legal advice and has not been reviewed by a lawyer
            </strong>
            ; it will be replaced with reviewed copy before {siteConfig.name}{" "}
            ships.
          </p>
        </Section>

        <Section title="Pre-orders and the campaign">
          <p>
            This site does not take payment. Pre-orders are handled entirely by
            the crowdfunding campaign, and the platform&apos;s own terms govern
            your pledge, when you are charged, and cancellation.
          </p>
        </Section>

        <Section title="Discount codes">
          <p>
            A discount code issued from this site is personal to the email
            address it was sent to, has no cash value, and applies only to a
            pre-order placed through our crowdfunding campaign. One code is
            issued per email address; asking again returns the same code.
          </p>
          <p>
            We may decline to honour a code that appears to have been shared,
            automated, or obtained in bulk. If the campaign does not go ahead,
            codes simply lapse and nothing is owed.
          </p>
        </Section>

        <Section title="Returns">
          <p>
            Once your unit has shipped, returns are accepted within 30 days of
            delivery for unused devices in their original packaging. Pledges
            made through the campaign are additionally subject to that
            platform&apos;s refund rules.
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
            {siteConfig.name} is a measurement device intended for
            tracking personal performance. It is not a medical device and
            is not intended to diagnose, treat, cure, or prevent any
            disease. Consult a qualified professional before making
            changes to your training program based on data from this
            product.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? Email{" "}
            <a
              href={`mailto:${externalLinks.supportEmail}`}
              className="text-accent underline-offset-4 hover:underline"
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
    <section className="grid gap-4 border-t border-border-hairline pt-8 md:grid-cols-12">
      <h2 className="font-display text-display-sm text-text-primary md:col-span-4">
        {title}
      </h2>
      <div className="flex flex-col gap-3 md:col-span-8">{children}</div>
    </section>
  );
}
