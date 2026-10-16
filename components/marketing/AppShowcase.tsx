"use client";

import Image, { type StaticImageData } from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Container, Section, SectionHeader } from "@/components/ui/section";
import { Display, Eyebrow } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import screenForceCurve from "@/public/app/screen-force-curve.png";
import screenLongevity from "@/public/app/screen-longevity.png";
import screenReadiness from "@/public/app/screen-readiness.png";

/**
 * AppShowcase — three iPhone renders, stepped with the arrows (or swiped).
 * Paragraph on the left, phone on the right; CSS scroll-snap +
 * IntersectionObserver keep the dots in sync with native swiping.
 *
 * Images are the iPhone renders in `public/app/` (sources in
 * `assets/source/`).
 */
interface Slide {
  eyebrow: string;
  title: string;
  body: string;
  image: StaticImageData;
  alt: string;
}

const slides: ReadonlyArray<Slide> = [
  {
    eyebrow: "Today's score",
    title: "One number you can act on.",
    body: "Your readiness score compares today's grip to your personal baseline, on a 0–100 scale. Push when it's high. Recover when it's not.",
    image: screenReadiness,
    alt: "GripFit app readiness score screen",
  },
  {
    eyebrow: "Trends & metrics",
    title: "A stronger approach to longevity.",
    body: "From one week to all-time, your trend line shows where you're headed before you feel it. Underneath: peak force, left/right balance, and AM vs PM strength, every session.",
    image: screenLongevity,
    alt: "GripFit app metrics screen with peak force, left/right balance, and AM vs PM strength",
  },
  {
    eyebrow: "Live force",
    title: "See the full force curve.",
    body: "Watch force build, peak, and fade in real time. More signal than a single max — and a live number to push past.",
    image: screenForceCurve,
    alt: "GripFit app recording a squeeze with the live force curve",
  },
];

export function AppShowcase() {
  const trackRef = useRef<HTMLOListElement | null>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = useCallback((i: number) => {
    const track = trackRef.current;
    const target = track?.children[i] as HTMLElement | undefined;
    if (!track || !target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  }, []);

  const goPrev = useCallback(() => scrollToIndex(Math.max(0, index - 1)), [index, scrollToIndex]);
  const goNext = useCallback(
    () => scrollToIndex(Math.min(slides.length - 1, index + 1)),
    [index, scrollToIndex],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        let max = entries[0];
        if (!max) return;
        for (const entry of entries) {
          if (entry.intersectionRatio > max.intersectionRatio) max = entry;
        }
        if (max.isIntersecting) {
          const i = items.indexOf(max.target as HTMLElement);
          if (i !== -1) setIndex(i);
        }
      },
      { root: track, threshold: [0.3, 0.6, 0.9] },
    );
    items.forEach((it) => observer.observe(it));
    return () => observer.disconnect();
  }, []);

  return (
    <Section aria-labelledby="app-heading">
      <Container>
        <SectionHeader
          title={<span id="app-heading">Built for iPhone.</span>}
          className="mb-12 md:mb-16"
        />

        <div className="relative">
          <ol
            ref={trackRef}
            aria-label="App screen gallery"
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto rounded-3xl border border-border-default bg-bg-elevated [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((slide, i) => (
              <li
                key={slide.title}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}: ${slide.title}`}
                className="grid w-full shrink-0 snap-center grid-cols-1 items-center gap-10 px-6 py-10 md:grid-cols-12 md:gap-14 md:px-12 md:py-14"
              >
                <div className="md:col-span-6">
                  <Eyebrow className="mb-4">
                    {slide.eyebrow} · {String(i + 1).padStart(2, "0")} /{" "}
                    {String(slides.length).padStart(2, "0")}
                  </Eyebrow>
                  <Display as="h3" size="lg">
                    {slide.title}
                  </Display>
                  <p className="mt-5 max-w-md text-[16px] leading-[1.7] text-text-secondary">
                    {slide.body}
                  </p>
                </div>
                <div className="flex justify-center md:col-span-6 md:justify-end">
                  <figure className="relative w-full max-w-[300px] drop-shadow-[0_30px_60px_rgba(2,6,23,0.7)]">
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      sizes="(min-width: 768px) 300px, 70vw"
                      className="h-auto w-full"
                    />
                  </figure>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.title}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => scrollToIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-8 bg-accent" : "w-4 bg-border-default hover:bg-border-strong",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <GalleryButton onClick={goPrev} disabled={index === 0} label="Previous slide">
                <ArrowLeft className="size-4" strokeWidth={1.75} />
              </GalleryButton>
              <GalleryButton
                onClick={goNext}
                disabled={index === slides.length - 1}
                label="Next slide"
              >
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </GalleryButton>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function GalleryButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-full border border-border-strong bg-transparent text-text-primary transition-colors hover:border-accent-bright hover:bg-accent-soft disabled:opacity-30 disabled:hover:border-border-strong disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
