"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useExperiment } from "@/components/experiment/PricingContext";
import { newEventId, trackPageView } from "@/lib/tracking/meta-pixel";

/**
 * Loads the Meta Pixel and fires a PageView on every route change.
 *
 * - Renders nothing when `pixelId` is null (no `NEXT_PUBLIC_META_PIXEL_ID`).
 * - The initial PageView is fired by the inline snippet once the SDK is
 *   ready; subsequent client-side navigations fire from the effect.
 * - PageView carries the assigned price + experiment id as custom params so
 *   Meta-side reports can be broken down by price. No personal data.
 * - Configure the Pixel itself (domain verification, event matching) in
 *   Meta Events Manager; nothing else is needed on the site.
 */
export function MetaPixel({ pixelId }: { pixelId: string | null }) {
  const pathname = usePathname();
  const { pricing, experimentId } = useExperiment();
  const firstRender = useRef(true);

  useEffect(() => {
    if (!pixelId) return;
    // The inline snippet fires the very first PageView; skip the duplicate.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    trackPageView(
      {
        assigned_price: pricing.kickstarter.amount,
        experiment_id: experimentId ?? undefined,
      },
      newEventId(),
    );
    // Only re-fire on navigation, not on pricing object identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, pixelId]);

  if (!pixelId) return null;

  const params = JSON.stringify({
    assigned_price: pricing.kickstarter.amount,
    ...(experimentId ? { experiment_id: experimentId } : {}),
  });

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');
fbq('track','PageView',${params},{eventID:(self.crypto&&crypto.randomUUID?crypto.randomUUID():String(Date.now()))});`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
