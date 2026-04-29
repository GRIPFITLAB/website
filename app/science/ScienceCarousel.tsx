"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * ScienceCarousel — central swipe card carousel for /science.
 *
 * One big card, full-width on desktop, swipeable on mobile via native
 * scroll-snap. Each card shows: stat headline, short body, source line.
 * The four cards are parallel arguments (CNS proxy / RFD / fatigue
 * index / asymmetry) — explicitly NOT sequential, which is why we
 * dropped the numbered-list treatment from the previous revamp.
 *
 * Implementation notes are identical to AppShowcase: scroll-snap +
 * IntersectionObserver to sync the active dot to scroll position. We
 * deliberately don't pull in embla / a third-party carousel — native
 * CSS scroll behaviour is enough for v1 and stays accessible.
 */

interface Card {
  eyebrow: string;
  stat: string;
  unit?: string;
  title: string;
  body: string;
  source: string;
}

const cards: ReadonlyArray<Card> = [
  {
    eyebrow: "CNS proxy",
    stat: "5–8",
    unit: "%",
    title: "A drop in peak grip precedes perceived fatigue.",
    body: "Across multiple cohorts of resistance-trained athletes, a 5–8% reduction in peak grip force reliably preceded subjective reports of fatigue by 24–72 hours. The signal is small but consistent — exactly what you want for an early-warning metric.",
    source: "Sports Medicine Review · 2022",
  },
  {
    eyebrow: "Rate of force development",
    stat: ">2",
    unit: "× SD",
    title: "RFD shifts before peak force does.",
    body: "Athletes in an overreaching block dropped their rate-of-force-development by more than two standard deviations from their baseline before their peak force changed at all. RFD is the more sensitive instrument for catching the slide early.",
    source: "European Journal of Applied Physiology · 2021",
  },
  {
    eyebrow: "Fatigue index",
    stat: "20",
    unit: "% drop",
    title: "Force decay over a sustained hold maps load history.",
    body: "Force-decay across a 6-second hold correlates with glycolytic load over the prior 48 hours. A larger decay = a more depleted system. The metric requires no perceived-effort scale, which is its main advantage in heads-down field environments.",
    source: "Journal of Strength & Conditioning Research · 2020",
  },
  {
    eyebrow: "Asymmetry",
    stat: "10–15",
    unit: "%",
    title: "L/R imbalance is a leading injury indicator.",
    body: "Bilateral asymmetries crossing the 10–15% threshold are linked with elevated soft-tissue injury risk in upper-extremity sports. Daily two-handed measurements catch developing imbalances early, before compensatory patterns establish.",
    source: "J. Orthopaedic & Sports Phys. Therapy · 2023",
  },
];

export function ScienceCarousel() {
  const trackRef = useRef<HTMLOListElement | null>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[i] as HTMLElement | undefined;
    if (!target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  }, []);

  const goPrev = useCallback(() => {
    scrollToIndex(Math.max(0, index - 1));
  }, [index, scrollToIndex]);

  const goNext = useCallback(() => {
    scrollToIndex(Math.min(cards.length - 1, index + 1));
  }, [index, scrollToIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        let max = entries[0];
        if (!max) return;
        for (const e of entries) {
          if (e.intersectionRatio > max.intersectionRatio) max = e;
        }
        if (max.isIntersecting) {
          const i = items.indexOf(max.target as HTMLElement);
          if (i !== -1) setIndex(i);
        }
      },
      { root: track, threshold: [0.4, 0.7, 0.9] },
    );
    items.forEach((it) => observer.observe(it));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      <ol
        ref={trackRef}
        aria-label="Research highlights"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card, i) => (
          <li
            key={card.title}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${cards.length}: ${card.title}`}
            className="grid w-full shrink-0 snap-center grid-cols-1 gap-10 rounded-3xl border border-border-default bg-bg-elevated p-8 md:grid-cols-12 md:gap-12 md:p-14"
          >
            <div className="md:col-span-5">
              <p className="text-eyebrow mb-5 text-text-tertiary">
                {card.eyebrow}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[88px] font-medium leading-[0.95] tracking-[-0.025em] text-accent tabular-nums md:text-[120px]">
                  {card.stat}
                </span>
                {card.unit ? (
                  <span className="font-display text-2xl font-medium text-accent md:text-3xl">
                    {card.unit}
                  </span>
                ) : null}
              </div>
              <p className="text-eyebrow mt-8 border-t border-border-hairline pt-5 text-text-tertiary">
                {card.source}
              </p>
            </div>
            <div className="md:col-span-7 md:self-center">
              <h3 className="font-display text-display-lg text-text-primary">
                {card.title}
              </h3>
              <p className="mt-5 text-[16px] leading-[1.7] text-text-secondary md:text-[17px]">
                {card.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {cards.map((card, i) => (
            <button
              key={card.title}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => scrollToIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? "w-8 bg-accent"
                  : "w-4 bg-accent-soft hover:bg-border-strong",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Previous slide"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border-strong bg-transparent text-text-primary transition-colors hover:border-accent hover:bg-accent-soft disabled:opacity-30 disabled:hover:border-border-strong disabled:hover:bg-transparent"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={index === cards.length - 1}
            aria-label="Next slide"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border-strong bg-transparent text-text-primary transition-colors hover:border-accent hover:bg-accent-soft disabled:opacity-30 disabled:hover:border-border-strong disabled:hover:bg-transparent"
          >
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
