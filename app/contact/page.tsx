import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about GripFit? Send us a message and we'll get back to you within 1–2 business days.",
};

export default function ContactPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-20 md:px-10 md:py-28">
      <p className="text-eyebrow mb-6 text-text-tertiary">Contact</p>
      <h1 className="font-display text-display-xl text-text-primary">
        Talk to us.
      </h1>
      <p className="mt-6 max-w-xl text-[17px] leading-[1.7] text-text-secondary">
        Pre-order questions, partnership inquiries, or athlete feedback —
        drop a line and we&apos;ll reply within 1–2 business days.
      </p>

      <section
        aria-label="Contact form"
        className="mt-14 rounded-2xl border border-border-default bg-bg-deep p-7 shadow-[var(--shadow-card)] md:p-10"
      >
        <ContactForm />
      </section>
    </article>
  );
}
