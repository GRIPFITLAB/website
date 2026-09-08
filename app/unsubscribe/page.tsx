import type { Metadata } from "next";

import { UnsubscribeForm } from "@/components/forms/UnsubscribeForm";
import { externalLinks } from "@/lib/config";

/**
 * Unsubscribe landing page, reached only from the link in a discount email.
 *
 * Intentionally absent from `lib/routes.ts`, so it stays out of the nav, the
 * footer, and `sitemap.xml` — it is a destination for one specific link, not
 * a page anyone should find by browsing.
 */
export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Remove your email address from GripFit updates.",
  robots: { index: false, follow: false },
};

interface UnsubscribePageProps {
  searchParams: Promise<{ e?: string; c?: string }>;
}

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const { e: email, c: code } = await searchParams;
  const hasLink = Boolean(email && code);

  return (
    <article className="mx-auto w-full max-w-2xl px-5 py-20 md:px-10 md:py-28">
      <p className="text-eyebrow mb-6 text-text-tertiary">Email preferences</p>
      <h1 className="font-display text-display-lg text-text-primary">
        Unsubscribe
      </h1>

      <section className="mt-12 rounded-2xl border border-border-default bg-bg-deep p-7 shadow-[var(--shadow-card)] md:p-10">
        {hasLink ? (
          <UnsubscribeForm email={email!} code={code!} />
        ) : (
          <p className="text-[15px] leading-[1.7] text-text-secondary">
            This page needs the unsubscribe link from the bottom of one of our
            emails. If you no longer have it, email{" "}
            <a
              href={`mailto:${externalLinks.supportEmail}`}
              className="text-accent underline underline-offset-4"
            >
              {externalLinks.supportEmail}
            </a>{" "}
            and we&apos;ll remove you.
          </p>
        )}
      </section>

      <p className="mt-8 text-[13px] leading-[1.7] text-text-tertiary">
        Unsubscribing stops all email from us. Any pre-order discount code we
        already sent you stays valid.
      </p>
    </article>
  );
}
