/**
 * AppShowcase — three phone mockups in the App Store marketing-screen
 * pattern. Each "phone" is a rounded rect with hairline border, a
 * notch / pill, and a deep gradient screen with abstract content.
 *
 * Per design.md §9 + §6: real screenshots replace these mockups when
 * they're produced. No photography or real iPhone trade dress is used
 * — the bezel is a generic minimal phone shape.
 *
 * Section sits between InTheBox and Science on the home page.
 */

interface Screen {
  eyebrow: string;
  title: string;
  body: string;
  /** Identifier for the abstract screen content rendered inside the
   *  phone. */
  graphic: "strength" | "recovery" | "history";
  /** Tilt for the phone in the trio — the middle one stands tall, the
   *  outer two lean in. */
  tilt: "left" | "center" | "right";
}

const screens: ReadonlyArray<Screen> = [
  {
    eyebrow: "Today",
    title: "Strength",
    body: "Live force curve, peak hold, and rate-of-force-development per squeeze.",
    graphic: "strength",
    tilt: "left",
  },
  {
    eyebrow: "Now",
    title: "Readiness",
    body: "0–100 score from grip, sleep, and load history. The number you train against.",
    graphic: "recovery",
    tilt: "center",
  },
  {
    eyebrow: "Trends",
    title: "History",
    body: "Seven-day, 30-day, and seasonal views. Drift early; confirm progress later.",
    graphic: "history",
    tilt: "right",
  },
];

export function AppShowcase() {
  return (
    <section className="relative overflow-hidden bg-bg-deep py-24 md:py-32">
      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="mb-16 grid gap-8 md:mb-20 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="text-eyebrow mb-5 text-accent">In your pocket</p>
            <h2 className="font-display text-display-xl text-text-primary">
              Built for iPhone, designed to disappear.
            </h2>
          </div>
          <p className="max-w-md text-[17px] leading-[1.7] text-text-secondary md:col-span-5 md:col-start-8 md:self-end">
            The GripFit app does the math so you can do the work. Three
            screens, no settings menus to dig through. Open, squeeze,
            decide.
          </p>
        </div>

        {/* Phone trio — desktop tilt, mobile stack */}
        <ul className="grid items-end gap-6 sm:grid-cols-3">
          {screens.map((screen) => (
            <li
              key={screen.title}
              className="flex flex-col items-center sm:items-start"
            >
              <PhoneMockup screen={screen} />
              <div className="mt-7 max-w-[260px] text-center sm:mt-9 sm:text-left">
                <p className="text-eyebrow mb-2.5 text-text-tertiary">
                  {screen.eyebrow}
                </p>
                <h3 className="font-display text-display-md text-text-primary">
                  {screen.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-text-secondary">
                  {screen.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-16 text-sm text-text-tertiary">
          App preview screens shown above are illustrative — final
          screenshots ship with the device.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   Pure-CSS phone mockup. The frame is a single rounded rect with a
   hairline border and a subtle inner shadow. The "screen" is a deep
   gradient surface whose content is the per-feature SVG below.
   ============================================================ */
function PhoneMockup({ screen }: { screen: Screen }) {
  const tiltClass =
    screen.tilt === "left"
      ? "sm:rotate-[-3deg] sm:translate-y-3"
      : screen.tilt === "right"
        ? "sm:rotate-[3deg] sm:translate-y-3"
        : "sm:translate-y-0";

  return (
    <div
      className={`relative w-[260px] max-w-full transition-transform duration-500 ease-out ${tiltClass}`}
    >
      {/* Soft shadow well behind the phone — gives it lift on the
          off-white band without resorting to a real drop-shadow. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 bottom-2 top-10 -z-10 rounded-[40px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(10,10,11,0.10), transparent 70%)",
        }}
      />

      {/* Phone bezel */}
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[40px] border border-border-strong bg-[#0a0a0b] p-2 shadow-[0_24px_60px_-24px_rgba(10,10,11,0.30)]">
        {/* Notch / pill */}
        <div
          aria-hidden
          className="absolute left-1/2 top-3 z-20 h-[18px] w-[80px] -translate-x-1/2 rounded-full bg-black"
        />

        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-gradient-to-b from-[#15141a] via-[#0d0c12] to-[#080709]">
          <PhoneScreen graphic={screen.graphic} title={screen.title} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Abstract per-screen content. Pure SVG, no real data, no real iOS
   widgets — generic enough to be read as "an app" without violating
   Apple trade dress. Tinted with text-accent (royal purple).
   ============================================================ */
function PhoneScreen({
  graphic,
  title,
}: {
  graphic: Screen["graphic"];
  title: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col px-5 pb-6 pt-12 text-white">
      {/* Status row */}
      <div className="mb-6 flex items-center justify-between text-[10px] font-medium tracking-[0.06em] text-white/55">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <span className="block size-1 rounded-full bg-white/55" />
          <span className="block size-1 rounded-full bg-white/55" />
          <span className="block size-1 rounded-full bg-white/55" />
          <span className="ml-2 block h-2 w-3 rounded-[1px] border border-white/55" />
        </span>
      </div>

      {/* Title */}
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

      {/* Graphic well */}
      <div className="relative mt-5 flex-1">
        {graphic === "strength" ? <StrengthScreen /> : null}
        {graphic === "recovery" ? <RecoveryScreen /> : null}
        {graphic === "history" ? <HistoryScreen /> : null}
      </div>

      {/* Bottom tab row — minimal, abstract */}
      <div className="mt-4 flex items-center justify-around border-t border-white/8 pt-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`block size-[6px] rounded-full ${
              i === 1 ? "bg-[#7c3aed]" : "bg-white/22"
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
      <div className="relative flex-1 rounded-[12px] border border-white/8 bg-white/2 p-2">
        <svg viewBox="0 0 240 140" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="ps-fill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.45" />
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
            stroke="#a78bfa"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="100" cy="22" r="3" fill="#a78bfa" />
          <circle cx="100" cy="22" r="7" fill="#a78bfa" fillOpacity="0.3" />
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[9px] uppercase tracking-[0.1em] text-white/55">
        <div>
          <p>Peak</p>
          <p
            className="mt-0.5 text-[12px] font-medium normal-case tracking-tight text-white"
            style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
          >
            112 lbs
          </p>
        </div>
        <div>
          <p>RFD</p>
          <p
            className="mt-0.5 text-[12px] font-medium normal-case tracking-tight text-white"
            style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
          >
            386 N/s
          </p>
        </div>
        <div>
          <p>Hold</p>
          <p
            className="mt-0.5 text-[12px] font-medium normal-case tracking-tight text-white"
            style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
          >
            6.3 s
          </p>
        </div>
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
            stroke="#a78bfa"
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
        {[
          { label: "Grip", value: "+4%" },
          { label: "Sleep", value: "7h 24m" },
          { label: "Load", value: "Mod" },
        ].map((row) => (
          <div key={row.label} className="text-center">
            <p>{row.label}</p>
            <p
              className="mt-1 text-[12px] font-medium normal-case tracking-tight text-white"
              style={{ fontFamily: "Inter Tight, Inter, sans-serif" }}
            >
              {row.value}
            </p>
          </div>
        ))}
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
      <div className="flex flex-1 items-end gap-1.5 rounded-[12px] border border-white/8 bg-white/2 p-3">
        {bars.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-[2px]"
            style={{
              height: `${h}%`,
              background:
                i >= 8
                  ? "#a78bfa"
                  : i >= 4
                    ? "rgba(167,139,250,0.55)"
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
