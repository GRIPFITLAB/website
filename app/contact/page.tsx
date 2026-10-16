import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/section";
import { Display, Eyebrow, Lead } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about GripFit? Send us a message and we'll get back to you within 1–2 business days.",
};

export default function ContactPage() {
  return (
    <Container className="max-w-3xl py-20 md:py-28">
      <Eyebrow className="mb-6">Contact</Eyebrow>
      <Display as="h1" size="xl">
        Talk to us.
      </Display>
      <Lead className="mt-6">
        Kickstarter questions, partnerships, or feedback — we reply within 1–2 business days.
      </Lead>

      <section
        aria-label="Contact form"
        className="mt-14 rounded-2xl border border-border-default bg-bg-elevated p-7 shadow-[var(--shadow-card)] md:p-10"
      >
        <ContactForm />
      </section>
    </Container>
  );
}
