import type { Metadata } from "next";

import { externalLinks, siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} collects, uses, and protects your data.`,
};

const updated = "April 26, 2026";

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-20 md:px-10 md:py-28">
      <p className="text-eyebrow mb-6 text-text-tertiary">Privacy</p>
      <h1 className="font-display text-display-xl text-text-primary">
        Privacy policy
      </h1>
      <p className="mt-6 text-sm text-text-tertiary">
        Last updated {updated}
      </p>

      <div className="mt-14 flex flex-col gap-10 text-[16px] leading-[1.8] text-text-secondary">
        <Section title="Overview">
          <p>
            This is a placeholder privacy policy. The text below is{" "}
            <strong className="text-text-primary">not legal advice</strong>{" "}
            and will be replaced with reviewed copy before {siteConfig.name}{" "}
            ships. Decisions.md §10 owns the canonical content plan; this
            file exists so the site can deploy with all routes resolving.
          </p>
        </Section>

        <Section title="Information we collect">
          <p>
            When you place a pre-order, our payment processor Shopify
            collects your name, email, shipping address, and payment
            details to fulfil the order. We do not store your payment
            information on our servers.
          </p>
          <p>
            When you fill out the contact form on this site we collect
            your name, email address, and the message you sent us. We use
            that information solely to respond to your inquiry.
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
              className="text-accent underline-offset-4 hover:underline"
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
