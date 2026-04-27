import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/ContactForm";
import { externalLinks } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about GripFit? Send us a message and we'll get back to you within 1–2 business days.",
};

export default function ContactPage() {
  return (
    <article className="mx-auto w-full max-w-2xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
        Contact
      </div>
      <h1 className="mb-4 font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.1] tracking-[-0.04em] text-foreground">
        Get in touch.
      </h1>
      <p className="mb-10 max-w-lg text-muted-foreground">
        Pre-order questions, partnership inquiries, or athlete feedback — drop
        us a line and we&apos;ll reply within 1–2 business days. You can also
        email{" "}
        <a
          href={`mailto:${externalLinks.supportEmail}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          {externalLinks.supportEmail}
        </a>
        .
      </p>

      <ContactForm />
    </article>
  );
}
