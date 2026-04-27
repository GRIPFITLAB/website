import { AppShowcase } from "@/components/marketing/AppShowcase";
import { CTA } from "@/components/marketing/CTA";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { InTheBox } from "@/components/marketing/InTheBox";
import { Science } from "@/components/marketing/Science";

/**
 * Home page composition.
 *
 * Section order mirrors WHOOP's "wear daily → complete picture →
 * choose a membership → backed by PhDs / worn by MVPs → final CTA"
 * pacing, adapted for GripFit:
 *
 *   Hero        → editorial headline + stat strip
 *   Features    → "complete picture" feature grid (real-time / bilateral / readiness / trends / hardware)
 *   HowItWorks  → 3-step rail (Squeeze / Curve / Readiness)
 *   InTheBox    → single bold pricing card (replaces 3-tier "Choose a membership")
 *   AppShowcase → 3 phone mockups (App Store style) — placeholder until real screenshots ship
 *   Science     → research citations (replaces "Backed by PhDs / worn by MVPs"; Decisions.md §6 excludes social proof)
 *   CTA         → final pre-order push
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <InTheBox />
      <AppShowcase />
      <Science />
      <CTA />
    </>
  );
}
