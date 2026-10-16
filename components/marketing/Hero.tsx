import Image from "next/image";
import Link from "next/link";

import { EmailDiscountTeaser } from "@/components/marketing/EmailDiscountTeaser";
import { PricingDisplay } from "@/components/marketing/PricingDisplay";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { Display, Eyebrow, Lead } from "@/components/ui/typography";
import { campaign, discountConfig, siteConfig } from "@/lib/config";

import heroScreen from "@/public/app/screen-live-force.png";

/**
 * Hero — headline, one paragraph, the three-tier pricing, two actions, and
 * the "See every squeeze" App Store panel (device + phone) on the right.
 *
 * H1 is `siteConfig.tagline` (lib/admin.ts). The lead paragraph is the
 * only hero prose.
 */
const lead =
  "A precision hand dynamometer calibrated with NIST-certified load cells. One daily squeeze tells you whether to push or recover. Engineered for athletes and health-conscious people who want real-time readiness intelligence.";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="bg-accent-wash pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"
      />

      <Container className="relative grid gap-14 pb-20 pt-16 md:grid-cols-12 md:gap-10 md:pb-28 md:pt-24 lg:min-h-[78vh]">
        <div className="flex flex-col justify-center md:col-span-7">
          <Eyebrow className="mb-7 inline-flex items-center gap-3 text-accent-bright">
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-accent-bright" />
            {campaign.isLive ? "Live on Kickstarter" : "Launching on Kickstarter"}
          </Eyebrow>

          <Display as="h1" size="2xl" className="max-w-[14ch]">
            {siteConfig.tagline}
          </Display>

          <Lead className="mt-7 max-w-xl">{lead}</Lead>

          <PricingDisplay className="mt-10 max-w-2xl" />

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button render={<Link href={campaign.href} {...campaign.linkProps} />} size="lg">
              {discountConfig.campaign.ctaLabel}
            </Button>
            <EmailDiscountTeaser />
          </div>
        </div>

        <div className="relative flex items-center justify-center md:col-span-5">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[90px]"
          />
          <figure className="relative w-full max-w-[500px] drop-shadow-[0_40px_80px_rgba(2,6,23,0.7)]">
            <Image
              src={heroScreen}
              alt="GripFit device paired with the iPhone app showing a live force reading"
              priority
              sizes="(min-width: 768px) 500px, 90vw"
              className="h-auto w-full"
            />
          </figure>
        </div>
      </Container>
    </section>
  );
}
