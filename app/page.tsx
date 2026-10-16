import { AppShowcase } from "@/components/marketing/AppShowcase";
import { ClosingCta } from "@/components/marketing/ClosingCta";
import { Comparison } from "@/components/marketing/Comparison";
import { Hero } from "@/components/marketing/Hero";
import { Specs } from "@/components/marketing/Specs";
import { WhyGrip } from "@/components/marketing/WhyGrip";

/**
 * Home page composition (Oct 15, 2026 launch).
 *
 *   Hero        → headline, pricing tiers, CTAs, App Store panel
 *   Specs       → five-row specification strip (replaces /product)
 *   Comparison  → GripFit vs a standard dynamometer (blue band)
 *   AppShowcase → four App Store panels, swipeable
 *   WhyGrip     → longevity / clinical-marker argument
 *   ClosingCta  → pricing recap + actions
 *
 * The first-visit `EmailDiscountModal` and the cookie notice are mounted
 * in `app/layout.tsx`.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Specs />
      <Comparison />
      <AppShowcase />
      <WhyGrip />
      <ClosingCta />
    </>
  );
}
