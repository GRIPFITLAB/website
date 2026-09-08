import type { Metadata } from "next";

import { externalLinks, siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} collects, uses, and protects your data.`,
};

const updated = "September 8, 2026";

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
            This policy describes what {siteConfig.name} actually collects
            today: an email address if you ask for a pre-order discount code,
            and whatever you send us through the contact form. Nothing else.
          </p>
          <p>
            It has{" "}
            <strong className="text-text-primary">
              not yet been reviewed by a lawyer
            </strong>{" "}
            and is not legal advice. It is written to be accurate rather than
            complete — where it is silent, assume we are not doing the thing.
          </p>
        </Section>

        <Section title="Pre-order discount emails">
          <p>
            If you submit your email address to receive a pre-order discount
            code, we store that address together with the code we issued you,
            the discount percentage, and the date you signed up.
          </p>
          <p>
            We use it to send you the code, and to email you about the
            crowdfunding campaign — most importantly when it opens. We will not
            sell it, and we will not pass it to anyone else for their own
            marketing.
          </p>
          <p>
            <strong className="text-text-primary">
              You can unsubscribe from any email we send you.
            </strong>{" "}
            Every message includes an unsubscribe link. Unsubscribing stops all
            email from us; any discount code we already issued stays valid.
          </p>
        </Section>

        <Section title="The contact form">
          <p>
            When you use the contact form we collect your name, email address,
            and your message, and we use them solely to reply to you.
          </p>
        </Section>

        <Section title="Who processes this data">
          <p>
            We use{" "}
            <a
              href="https://www.brevo.com/legal/privacypolicy/"
              className="text-accent underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Brevo
            </a>{" "}
            to store contacts and send email, and{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              className="text-accent underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vercel
            </a>{" "}
            to host the site. Brevo holds your email address and discount code;
            Vercel processes the requests your browser makes, including your IP
            address in its server logs.
          </p>
          <p>
            This site sets{" "}
            <strong className="text-text-primary">no cookies</strong> and runs
            no analytics or advertising trackers. Some preferences — whether
            you have dismissed the discount pop-up, for instance — are kept in
            your browser&apos;s local storage on your own device, and are never
            sent to us.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            Email addresses captured for a discount code are kept until the
            crowdfunding campaign has concluded and orders are fulfilled, or
            until you unsubscribe or ask us to delete them — whichever comes
            first. Contact-form messages are kept as long as needed to resolve
            what you wrote in about.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can ask for a copy of your data, a correction to it, or its
            deletion, by emailing{" "}
            <a
              href={`mailto:${externalLinks.supportEmail}`}
              className="text-accent underline-offset-4 hover:underline"
            >
              {externalLinks.supportEmail}
            </a>
            . Deleting your record also deletes the discount code attached to
            it — if you sign up again afterwards you will be issued a new one.
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
