import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-bg-deep px-6 py-28 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-warm-wash"
      />

      <div className="relative flex flex-col items-center gap-6">
        <p className="text-eyebrow text-text-tertiary">Error 404</p>
        <span
          className="font-display text-[120px] font-medium leading-none tracking-[-0.025em] text-accent sm:text-[160px]"
          aria-hidden
        >
          404
        </span>
        <h1 className="font-display text-display-lg max-w-xl text-text-primary">
          This page doesn&apos;t exist.
        </h1>
        <p className="max-w-md text-balance text-[15px] leading-[1.65] text-text-secondary">
          The link may be broken, or the page may have moved. Try one of
          the links below.
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button
            render={<Link href={routes.home.href} />}
            size="lg"
            className="h-12 px-8 text-sm font-semibold uppercase tracking-[0.08em]"
          >
            Back to home
          </Button>
          <Button
            render={<Link href={routes.product.href} />}
            size="lg"
            variant="outline"
            className="h-12 border-border-strong bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.08em] text-text-primary hover:border-accent hover:bg-accent-soft"
          >
            See the product
          </Button>
        </div>
      </div>
    </section>
  );
}
