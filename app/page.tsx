import { AppShowcase } from "@/components/marketing/AppShowcase";
import { Comparison } from "@/components/marketing/Comparison";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";

/**
 * Home page composition (Jun 28, 2026 revamp).
 *
 *   Hero        → headline + pricing + what's-in-the-box product card
 *   Comparison  → GripFit vs the rest (warm-charcoal band)
 *   AppShowcase → swipe gallery of app views
 *   Features    → "what you measure" text cards
 *
 * The first-visit `EmailDiscountModal` (extra-15%-off email capture) is
 * mounted in `app/layout.tsx` so it auto-opens on every page and can be
 * triggered from any `<EmailDiscountTeaser />` site-wide. The footer's
 * always-visible signup form lives in `components/layout/Footer.tsx`.
 *
 * Removed in this revamp: the standalone Readiness benefit-card section
 * and the bottom InTheBox pricing card (it duplicated the hero's pricing
 * + buy link; "what's in the box" now lives in the hero product card).
 * Both component files are parked on disk, unused. The Science marketing
 * component still ships and is reused inside `/science`.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Comparison />
      <AppShowcase />
      <Features />
    </>
  );
}
