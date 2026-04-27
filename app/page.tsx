import { CTA } from "@/components/marketing/CTA";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";

/**
 * Home page composition.
 *
 * Sections per Decisions.md §6 Page Inventory:
 *   Hero → Features → HowItWorks → CTA
 *
 * Explicitly NO social-proof block (Q1 resolution: "all, except social proof").
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </>
  );
}
