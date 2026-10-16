import Link from "next/link";

import { PricingDisplay } from "@/components/marketing/PricingDisplay";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { Display, Eyebrow } from "@/components/ui/typography";
import { campaign, discountConfig } from "@/lib/config";

/**
 * Closing band — pricing recap + the campaign CTA, once more, at the end.
 * No email teaser here: the footer's email form sits directly below.
 */
export function ClosingCta() {
  return (
    <Section aria-labelledby="cta-heading" wash>
      <Container className="max-w-3xl text-center">
        <Eyebrow className="mb-6">Kickstarter</Eyebrow>
        <Display as="h2" size="xl">
          <span id="cta-heading">Know whether to push or recover.</span>
        </Display>
        <PricingDisplay variant="compact" className="mx-auto mt-10 justify-center" />
        <div className="mt-8 flex justify-center">
          <Button render={<Link href={campaign.href} {...campaign.linkProps} />} size="lg">
            {discountConfig.campaign.ctaLabel}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
