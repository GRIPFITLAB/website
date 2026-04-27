import type { Metadata } from "next";

import { externalLinks, siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} collects, uses, and protects your data.`,
};

const updated = "April 26, 2026";

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
        Privacy
      </div>
      <h1 className="mb-2 font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.1] tracking-[-0.04em] text-foreground">
        Privacy policy
      </h1>
      <p className="mb-10 text-sm text-muted-foreground/70">
        Last updated {updated}
      </p>

      <div className="flex flex-col gap-8 text-[15px] leading-[1.8] text-muted-foreground">
        <Section title="Overview">
          <p>
            This is a placeholder privacy policy. The text below is{" "}
            <strong className="text-foreground">not legal advice</strong> and
            will be replaced with reviewed copy before {siteConfig.name}{" "}
            ships. Decisions.md §10 owns the canonical content plan; this
            file exists so the site can deploy with all routes resolving.
          </p>
        </Section>

        <Section title="Information we collect">
          <p>
            When you place a pre-order, our payment processor Shopify collects
            your name, email, shipping address, and payment details to fulfil
            the order. We do not store your payment information on our
            servers.
          </p>
          <p>
            When you fill out the contact form on this site we collect your
            name, email address, and the message you sent us. We use that
            information solely to respond to your inquiry.
          </p>
          <p>
            We use Vercel Analytics to measure aggregate site usage. No
            personally identifiable information is collected.
          </p>
        </Section>

        <Section title="How we use your information">
          <p>
            To fulfil orders, respond to support requests, and improve the
            product. We do not sell your personal information.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can request a copy of, correction to, or deletion of your
            personal data by emailing{" "}
            <a
              href={`mailto:${externalLinks.supportEmail}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {externalLinks.supportEmail}
            </a>
            .
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? Email{" "}
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
