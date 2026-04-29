import { AppShowcase } from "@/components/marketing/AppShowcase";
import { Comparison } from "@/components/marketing/Comparison";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";
import { InTheBox } from "@/components/marketing/InTheBox";
import { Readiness } from "@/components/marketing/Readiness";

/**
 * Home page composition (Apr 29, 2026 revamp).
 *
 *   Hero        → editorial headline + product image + pre-order pricing
 *   Features    → "complete picture" feature grid
 *   Readiness   → benefit cards explaining how the readiness score is built
 *   AppShowcase → swipe gallery (image-right, paragraph-left per slide)
 *   Comparison  → GripFit vs standard dynamometer (warm-charcoal band)
 *   InTheBox    → final pricing card + Talk-to-us CTA
 *
 * The first-visit `EmailDiscountModal` (extra-15%-off email capture) is
 * mounted in `app/layout.tsx` so it auto-opens on every page and can be
 * triggered from any `<EmailDiscountTeaser />` site-wide. The footer's
 * always-visible signup form lives in `components/layout/Footer.tsx`.
 *
 * Removed in this revamp: HowItWorks (3-step rail) and the dedicated
 * CTA section (it duplicated InTheBox). The Science marketing component
 * is no longer rendered on the home page; it still ships as
 * `components/marketing/Science.tsx` and is reused inside `/science`.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Readiness />
      <AppShowcase />
      <Comparison />
      <InTheBox />
    </>
  );
}
