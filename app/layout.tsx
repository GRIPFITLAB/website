import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";

import { VisitorProvider } from "@/components/experiment/VisitorProvider";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { EmailDiscountModal } from "@/components/marketing/EmailDiscountModal";
import { CookieNotice } from "@/components/tracking/CookieNotice";
import { MetaPixel } from "@/components/tracking/MetaPixel";
import { siteConfig, trackingConfig } from "@/lib/config";
import { themeColor } from "@/lib/theme";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteConfig.url ? new URL(siteConfig.url) : undefined,
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: "/brand/gripfit-app-icon.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/brand/gripfit-app-icon.png"],
  },
};

export const viewport: Viewport = {
  themeColor,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/InterTight-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <VisitorProvider>
          <Nav />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          {/* Mounted globally so any <EmailDiscountTeaser /> can open it. */}
          <EmailDiscountModal />
          <CookieNotice />
          <MetaPixel pixelId={trackingConfig.metaPixelId} />
        </VisitorProvider>
        <Analytics />
      </body>
    </html>
  );
}
