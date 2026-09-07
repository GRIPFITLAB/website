import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { EmailDiscountForm } from "@/components/marketing/EmailDiscountForm";
import { PricingDisplay } from "@/components/marketing/PricingDisplay";
import { Button } from "@/components/ui/button";
import {
  campaign,
  discountConfig,
  getStackedPreorderPricing,
  siteConfig,
} from "@/lib/config";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Kickstarter campaign",
  description:
    "The GripFit Kickstarter campaign is in preparation. Leave your email and we'll tell you the day it opens — with a stacked discount code.",
};

/**
 * `/kickstarter` — holding page for the crowdfunding campaign.
 *
 * Every "Back the campaign" CTA lands here while
 * `lib/admin.ts → links.crowdfundingUrl` is `null`. Set that URL and the
 * CTAs route straight to Kickstarter instead; this page stays reachable
 * from the footer and flips to a "campaign is live" state.
 *
 * The page's job is to convert an early click into an email address, so
 * the signup form is the primary action, not a footnote.
 */
export default function KickstarterPage() {
  const { formattedStacked, formattedList } = getStackedPreorderPricing();
  const campaignPct = Math.round(discountConfig.preorder.percentOff * 100);
  const emailPct = Math.round(discountConfig.email.percentOff * 100);

  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-20 md:px-10 md:py-28">
      <p className="text-eyebrow mb-6 inline-flex items-center gap-3 text-promo">
        <span aria-hidden className="inline-block size-1.5 rounded-full bg-promo" />
        {campaign.isLive ? "The campaign is live" : "Campaign in preparation"}
      </p>

      <h1 className="font-display text-display-xl text-text-primary">
        {campaign.isLive
          ? "Back GripFit on Kickstarter."
          : "The campaign isn't open yet."}
      </h1>

      {campaign.isLive ? (
        <>
          <p className="mt-7 max-w-xl text-[17px] leading-[1.7] text-text-secondary">
            Pre-orders for {siteConfig.name} are handled on Kickstarter.
            Backing the campaign at the pre-order tier gets you{" "}
            {campaignPct}% off list
            {discountConfig.preorder.freeShipping
              ? " plus free US shipping"
              : ""}
            .
          </p>
          <div className="mt-10">
            <Button
              render={
                <Link href={campaign.href} {...campaign.linkProps} />
              }
              size="lg"
              className="h-12 px-9 text-sm font-semibold uppercase tracking-[0.08em] hover:shadow-[var(--shadow-glow)]"
            >
              {discountConfig.preorder.ctaLabel}
              <ArrowRight className="ml-1 size-4" strokeWidth={2} />
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-7 max-w-xl text-[17px] leading-[1.7] text-text-secondary">
          We&apos;re still putting the Kickstarter campaign together —
          finalising the production run, the pledge tiers, and the
          shipping timeline. It isn&apos;t accepting backers yet.
        </p>
      )}

      {/* Email capture — the point of the page while the campaign is dark. */}
      <section
        aria-labelledby="kickstarter-notify-heading"
        className="mt-14 rounded-2xl border border-border-default bg-bg-elevated p-7 shadow-[var(--shadow-card)] md:mt-16 md:p-10"
      >
        <p className="text-eyebrow mb-4 text-promo">
          {discountConfig.email.label} · stacks on Kickstarter
        </p>
        <h2
          id="kickstarter-notify-heading"
          className="font-display text-display-lg text-text-primary"
        >
          {campaign.isLive
            ? discountConfig.email.headline
            : "Get told the moment it opens."}
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-text-secondary">
          {campaign.isLive
            ? discountConfig.email.body
            : `Leave your email and we'll write to you the day the campaign
               goes live. You'll get a private ${emailPct}%-off code that stacks
               on top of the ${campaignPct}% Kickstarter pre-order discount —
               ${formattedStacked} instead of ${formattedList}.`}
        </p>

        <EmailDiscountForm
          variant="footer"
          idPrefix="kickstarter"
          className="mt-7 max-w-xl"
        />
        <p className="mt-3 text-[11px] leading-[1.5] text-text-tertiary">
          No spam. Unsubscribe anytime. We&apos;ll only email you about
          pre-order updates.
        </p>
      </section>

      {/* Pricing recap + onward links */}
      <section className="mt-16 grid gap-10 border-t border-border-hairline pt-12 md:mt-20 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="text-eyebrow mb-5 text-text-tertiary">
            Pre-order pricing
          </p>
          <PricingDisplay />
        </div>
        <div className="flex flex-col gap-4 md:col-span-6 md:items-start md:justify-center">
          <p className="text-[15px] leading-[1.65] text-text-secondary">
            While you wait — the full specification and the research
            behind the readiness score are both on the site.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              render={<Link href={routes.product.href} />}
              variant="outline"
              className="border-border-strong bg-transparent text-sm font-semibold uppercase tracking-[0.08em] text-text-primary hover:border-accent hover:bg-accent-soft"
            >
              See the product
            </Button>
            <Button
              render={<Link href={routes.science.href} />}
              variant="outline"
              className="border-border-strong bg-transparent text-sm font-semibold uppercase tracking-[0.08em] text-text-primary hover:border-accent hover:bg-accent-soft"
            >
              The science
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}
