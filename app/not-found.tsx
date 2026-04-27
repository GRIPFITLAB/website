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
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 left-1/2 size-[40rem] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <span className="font-display text-7xl font-extrabold tracking-tight text-primary/90 sm:text-8xl">
          404
        </span>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          The link may be broken, or the page may have moved. Try one of the
          links below.
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button render={<Link href={routes.home.href} />} size="lg">
            Back to home
          </Button>
          <Button
            render={<Link href={routes.product.href} />}
            size="lg"
            variant="outline"
          >
            See the product
          </Button>
        </div>
      </div>
    </section>
  );
}
