"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * AppShowcase — swipe gallery (Apr 29, 2026 revamp).
 *
 * Layout per page: paragraph on the left, phone mockup on the right.
 * Pages are stacked horizontally inside a `scroll-snap` container, so
 * the gallery is keyboard-accessible (tab moves through arrow buttons,
 * the slides themselves are static landmarks) AND swipeable on touch
 * devices via native horizontal scroll. We sync `currentIndex` to
 * scroll position via an IntersectionObserver so the dot pagination
 * always reflects what the visitor is looking at.
 *
 * Images / phone screens are pure-CSS placeholders — Decisions.md §16
 * Q9 owns the swap-in.
 */

interface Slide {
  eyebrow: string;
  title: string;
  body: string;
  graphic: "strength" | "recovery" | "history";
}

const slides: ReadonlyArray<Slide> = [
  {
    eyebrow: "Live force",
    title: "Watch the curve climb.",
    body: "The Strength screen streams 100 samples per second as you squeeze. Peak force, rate-of-force-development, and hold time fall out automatically — same dataset coaches and physical-therapy clinics already use, just at consumer accessibility.",
    graphic: "strength",
  },
  {
    eyebrow: "Today's score",
    title: "One number you can act on.",
    body: "Readiness compresses your last 24 hours of grip, sleep, and load history into a 0–100 score. Above 80, train hard. Below 60, deload. The thresholds shift with your baseline, not someone else's.",
    graphic: "recovery",
  },
  {
    eyebrow: "Trends",
    title: "See the season, not the day.",
    body: "Twelve weeks of rolling readiness reveal the shape of an arc — the climb into camp, the dip during a meet block, the rebuild. Drift early, confirm progress later.",
    graphic: "history",
  },
];

export function AppShowcase() {
  const trackRef = useRef<HTMLOListElement | null>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[i] as HTMLElement | undefined;
    if (!target) return;
    track.scrollTo({
      left: target.offsetLeft,
      behavior: "smooth",
    });
  }, []);

  const goPrev = useCallback(() => {
    scrollToIndex(Math.max(0, index - 1));
  }, [index, scrollToIndex]);

  const goNext = useCallback(() => {
    scrollToIndex(Math.min(slides.length - 1, index + 1));
  }, [index, scrollToIndex]);

  // Sync `index` to whichever slide is most-visible. Using
  // IntersectionObserver here keeps native horizontal scroll feeling
  // organic without us having to debounce a `scroll` listener.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const items = Array.from(track.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the largest intersection ratio.
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
      {
        root: track,
        threshold: [0.3, 0.6, 0.9],
      },
    );
    items.forEach((it) => observer.observe(it));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-bg-canvas py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="mb-14 grid gap-8 md:mb-20 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-eyebrow mb-5 text-text-tertiary">
              In your pocket
            </p>
            <h2 className="font-display text-display-xl text-text-primary">
              Built for iPhone, designed to disappear.
            </h2>
          </div>
          <p className="max-w-md text-[17px] leading-[1.7] text-text-secondary md:col-span-4 md:col-start-9 md:self-end">
            The GripFit app does the math so you can do the work. Three
            screens, no settings menus to dig through.
          </p>
        </div>

        {/* Gallery */}
        <div className="relative">
          <ol
            ref={trackRef}
            aria-label="App screen gallery"
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto rounded-3xl bg-bg-elevated [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((slide, i) => (
              <li
                key={slide.title}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}: ${slide.title}`}
                className="grid w-full shrink-0 snap-center grid-cols-1 items-center gap-10 px-6 py-10 md:grid-cols-12 md:gap-14 md:px-12 md:py-14"
              >
                <div className="md:col-span-6 md:order-1">
                  <p className="text-eyebrow mb-4 text-text-tertiary">
                    {slide.eyebrow} · {String(i + 1).padStart(2, "0")} /{" "}
                    {String(slides.length).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-display-lg text-text-primary">
                    {slide.title}
                  </h3>
                  <p className="mt-5 max-w-md text-[16px] leading-[1.7] text-text-secondary">
                    {slide.body}
                  </p>
                </div>
                <div className="flex justify-center md:col-span-6 md:order-2 md:justify-end">
                  <PhoneMockup graphic={slide.graphic} title={slide.title} />
                </div>
              </li>
            ))}
          </ol>

          {/* Controls */}
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
                disabled={index === slides.length - 1}
                aria-label="Next slide"
                className="inline-flex size-11 items-center justify-center rounded-full border border-border-strong bg-transparent text-text-primary transition-colors hover:border-accent hover:bg-accent-soft disabled:opacity-30 disabled:hover:border-border-strong disabled:hover:bg-transparent"
              >
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-10 text-[13px] text-text-tertiary">
          App preview screens shown above are illustrative — final
          screenshots ship with the device.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   Pure-CSS phone mockup — same generic frame as the prior version,
   warm-cream-aware. No real iPhone bezels, no Apple trade dress.
   ============================================================ */
function PhoneMockup({
  graphic,
  title,
}: {
  graphic: Slide["graphic"];
  title: string;
}) {
  return (
    <div className="relative w-[260px] max-w-full md:w-[280px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 bottom-2 top-10 -z-10 rounded-[44px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(28,26,23,0.10), transparent 70%)",
        }}
      />
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[44px] border border-border-strong bg-[#0f0d0a] p-2 shadow-[0_24px_60px_-24px_rgba(28,26,23,0.30)]">
        <div
          aria-hidden
          className="absolute left-1/2 top-3 z-20 h-[18px] w-[80px] -translate-x-1/2 rounded-full bg-black"
        />
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-gradient-to-b from-[#15140f] via-[#0d0c08] to-[#080706]">
          <PhoneScreen graphic={graphic} title={title} />
        </div>
      </div>
    </div>
  );
}

function PhoneScreen({
  graphic,
  title,
}: {
  graphic: Slide["graphic"];
  title: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col px-5 pb-6 pt-12 text-white">
      <div className="mb-6 flex items-center justify-between text-[10px] font-medium tracking-[0.06em] text-white/55">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <span className="block size-1 rounded-full bg-white/55" />
          <span className="block size-1 rounded-full bg-white/55" />
          <span className="block size-1 rounded-full bg-white/55" />
          <span className="ml-2 block h-2 w-3 rounded-[1px] border border-white/55" />
        </span>
      </div>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45"
        style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
      >
        GripFit
      </p>
      <h4
        className="mt-1 text-[22px] font-medium leading-[1.05] tracking-[-0.02em]"
        style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
      >
        {title}
      </h4>

      <div className="relative mt-5 flex-1">
        {graphic === "strength" ? <StrengthScreen /> : null}
        {graphic === "recovery" ? <RecoveryScreen /> : null}
        {graphic === "history" ? <HistoryScreen /> : null}
      </div>

      <div className="mt-4 flex items-center justify-around border-t border-white/10 pt-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`block size-[6px] rounded-full ${
              i === 1 ? "bg-[#f3ece2]" : "bg-white/22"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function StrengthScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex items-baseline gap-2">
        <span
          className="text-[40px] font-medium leading-none tabular-nums tracking-[-0.025em]"
          style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
        >
          112
        </span>
        <span className="text-[12px] uppercase tracking-[0.12em] text-white/45">
          lbs
        </span>
      </div>
      <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-white/45">
        Live force curve
      </p>
      <div className="relative flex-1 rounded-[12px] border border-white/10 bg-white/[0.02] p-2">
        <svg viewBox="0 0 240 140" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="ps-fill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#f3ece2" stopOpacity="0" />
              <stop offset="100%" stopColor="#f3ece2" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={0}
              y1={20 + i * 24}
              x2={240}
              y2={20 + i * 24}
              stroke="white"
              strokeOpacity="0.06"
            />
          ))}
          <path
            d="M 0 130 L 30 128 L 50 110 L 70 38 L 100 22 L 140 28 L 170 50 L 200 78 L 240 110 L 240 140 L 0 140 Z"
            fill="url(#ps-fill)"
          />
          <path
            d="M 0 130 L 30 128 L 50 110 L 70 38 L 100 22 L 140 28 L 170 50 L 200 78 L 240 110"
            fill="none"
            stroke="#f3ece2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="100" cy="22" r="3" fill="#f3ece2" />
          <circle cx="100" cy="22" r="7" fill="#f3ece2" fillOpacity="0.3" />
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[9px] uppercase tracking-[0.1em] text-white/55">
        <Stat label="Peak" value="112 lbs" />
        <Stat label="RFD" value="386 N/s" />
        <Stat label="Hold" value="6.3 s" />
      </div>
    </div>
  );
}

function RecoveryScreen() {
  return (
    <div className="flex h-full flex-col items-center">
      <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/45">
        Today&apos;s readiness
      </p>
      <div className="relative my-3 size-[150px]">
        <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
          <circle
            cx="100"
            cy="100"
            r="78"
            fill="none"
            stroke="white"
            strokeOpacity="0.08"
            strokeWidth="10"
          />
          <circle
            cx="100"
            cy="100"
            r="78"
            fill="none"
            stroke="#f3ece2"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 78 * 0.86} ${2 * Math.PI * 78}`}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[44px] font-medium leading-none tabular-nums tracking-[-0.025em]"
            style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
          >
            86
          </span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.18em] text-white/55">
            Ready
          </span>
        </div>
      </div>
      <div className="mt-2 grid w-full grid-cols-3 gap-2 text-[9px] uppercase tracking-[0.1em] text-white/55">
        <Stat label="Grip" value="+4%" center />
        <Stat label="Sleep" value="7h 24m" center />
        <Stat label="Load" value="Mod" center />
      </div>
    </div>
  );
}

function HistoryScreen() {
  const bars = [62, 71, 58, 80, 74, 86, 82, 90, 88, 84, 92, 88];
  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex items-baseline gap-2">
        <span
          className="text-[36px] font-medium leading-none tabular-nums tracking-[-0.025em]"
          style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
        >
          +18%
        </span>
        <span className="text-[10px] uppercase tracking-[0.12em] text-white/45">
          12-week
        </span>
      </div>
      <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-white/45">
        Rolling readiness
      </p>
      <div className="flex flex-1 items-end gap-1.5 rounded-[12px] border border-white/10 bg-white/[0.02] p-3">
        {bars.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-[2px]"
            style={{
              height: `${h}%`,
              background:
                i >= 8
                  ? "#f3ece2"
                  : i >= 4
                    ? "rgba(243,236,226,0.55)"
                    : "rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[0.12em] text-white/45">
        <span>Wk 1</span>
        <span>Wk 6</span>
        <span>Wk 12</span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  center,
}: {
  label: string;
  value: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <p>{label}</p>
      <p
        className="mt-0.5 text-[12px] font-medium normal-case tracking-tight text-white"
        style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}
