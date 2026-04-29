import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { DiscountBanner } from "@/components/marketing/DiscountBanner";
import { EmailDiscountModal } from "@/components/marketing/EmailDiscountModal";
import { siteConfig } from "@/lib/config";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteConfig.url ? new URL(siteConfig.url) : undefined,
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  // TODO(brand): final OG image, twitter handle, manifest icons once the
  // first photographic assets land. For now metadata uses tagline + description.
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3ece2",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Preload the Inter Tight variable file — it's the LCP-critical
            display font on the hero. Inter Variable (body) loads
            asynchronously. */}
        <link
          rel="preload"
          href="/fonts/InterTight-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <DiscountBanner />
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Mounted globally so any <EmailDiscountTeaser /> on any page
            can open it via the shared custom-event channel. */}
        <EmailDiscountModal />
      </body>
    </html>
  );
}
