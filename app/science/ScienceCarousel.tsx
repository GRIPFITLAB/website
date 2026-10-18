"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * ScienceCarousel — central swipe card carousel for /science.
 *
 * One big card, full-width on desktop, swipeable on mobile via native
 * scroll-snap. Each card shows: stat headline, short body, source line.
 * The four cards are parallel arguments (longevity / asymmetry /
 * fatigue & recovery / RFD) — explicitly NOT sequential, which is why we
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
    eyebrow: "Longevity",
    stat: "16%",
    title: "A stronger predictor than blood pressure.",
    body: "Each 5 kg drop in grip strength was linked to a 16% higher risk of death from any cause across 140,000 adults in 17 countries. Grip outperformed systolic blood pressure as a predictor of all-cause and cardiovascular mortality.",
    source: "The Lancet · 2015",
  },
  {
    eyebrow: "Asymmetry",
    stat: "1.62×",
    title: "L/R imbalance is a signal, not a quirk.",
    body: "Every 10% increase in left/right grip asymmetry was tied to 1.62× higher odds of poorer balance. Asymmetry and weakness together predicted future functional decline better than either one alone. Two-handed tracking shows both.",
    source: "Archives of Gerontology and Geriatrics · 2022",
  },
  {
    eyebrow: "Fatigue & recovery",
    stat: "10",
    unit: "reps",
    title: "How you fade matters more than your peak.",
    body: "A 10-rep maximal grip protocol predicted fall risk better than a single max squeeze. People who fatigued faster and recovered slower had higher fall rates. Repeated-effort tracking captures what one reading misses.",
    source: "Clinical Rehabilitation · 2025",
  },
  {
    eyebrow: "Rate of force development",
    stat: "0–200",
    unit: "ms",
    title: "How fast you squeeze tells you more.",
    body: "Explosive grip force in the first 200 milliseconds related to functional mobility better than maximum grip strength. Only a device that records the full force curve can measure it.",
    source: "Acta of Bioengineering and Biomechanics · 2015",
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
                <span className="font-display text-[88px] font-medium leading-[0.95] tracking-[-0.025em] text-accent-bright tabular-nums md:text-[120px]">
                  {card.stat}
                </span>
                {card.unit ? (
                  <span className="font-display text-2xl font-medium text-accent-bright md:text-3xl">
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
