import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { EmailDiscountForm } from "@/components/marketing/EmailDiscountForm";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { Display, Eyebrow, Lead } from "@/components/ui/typography";
import { campaign, discountConfig, emailLockHeadline, siteConfig } from "@/lib/config";
import { getVisitorPricing } from "@/lib/experiment/server";

export const metadata: Metadata = {
  title: "Kickstarter",
  description: `Join the email list to lock in your Super Early Bird price, and we'll tell you the day the ${siteConfig.name} Kickstarter opens.`,
};

/**
 * `/kickstarter` — holding page for the crowdfunding campaign.
 *
 * Every "Back on Kickstarter" CTA lands here while
 * `lib/admin.ts → links.crowdfundingUrl` is `null`. Set that URL and the
 * CTAs route straight to Kickstarter; this page stays reachable from the
 * footer and flips to a "campaign is live" state.
 *
 * Deliberately sparse: headline, one sentence, the email card.
 */
export default async function KickstarterPage() {
  const pricing = await getVisitorPricing();
  const shipping = discountConfig.campaign.freeShipping ? " with free US shipping" : "";

  return (
    <Container className="max-w-3xl py-20 md:py-28">
      <Eyebrow className="mb-6 inline-flex items-center gap-3 text-accent-bright">
        <span aria-hidden className="inline-block size-1.5 rounded-full bg-accent-bright" />
        {campaign.isLive ? "Live on Kickstarter" : "Launching on Kickstarter"}
      </Eyebrow>

      <Display as="h1" size="xl">
        {campaign.isLive ? `Back ${siteConfig.name} on Kickstarter.` : "The campaign isn't open yet."}
      </Display>

      <Lead className="mt-7">
        {campaign.isLive
          ? `Back on Kickstarter for no more than ${pricing.kickstarter.formatted}${shipping}. Join the email list below to lock in ${pricing.superEarlyBird.formatted}.`
          : `Join the email list to lock in ${pricing.superEarlyBird.formatted} — you'll never pay more than ${pricing.kickstarter.formatted} on Kickstarter. We'll write to you the day it opens.`}
      </Lead>

      {campaign.isLive ? (
        <div className="mt-10">
          <Button render={<Link href={campaign.href} {...campaign.linkProps} />} size="lg">
            {discountConfig.campaign.ctaLabel}
            <ArrowRight className="size-4" strokeWidth={2} />
          </Button>
        </div>
      ) : null}

      <section
        aria-labelledby="kickstarter-notify-heading"
        className="mt-14 rounded-2xl border border-border-default bg-bg-elevated p-7 shadow-[var(--shadow-card)] md:p-10"
      >
        <Eyebrow promo className="mb-4">
          {discountConfig.campaign.tierLabels.superEarlyBird}
        </Eyebrow>
        <Display as="h2" size="lg">
          <span id="kickstarter-notify-heading">{emailLockHeadline(pricing)}</span>
        </Display>
        <EmailDiscountForm
          variant="footer"
          idPrefix="kickstarter"
          source="kickstarter"
          className="mt-7 max-w-xl"
        />
      </section>
    </Container>
  );
}
