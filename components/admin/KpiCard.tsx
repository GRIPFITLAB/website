import { TrendingDown, TrendingUp } from "lucide-react";

import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

import { formatPct } from "./format";

export interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  /** Week-over-week change as a ratio; `null` hides the pill. */
  delta?: number | null;
  /** Small trend line under the value. */
  spark?: number[];
  /** Accent treatment for the headline metric. */
  highlight?: boolean;
  /** Stagger position for the entrance animation. */
  index?: number;
}

export function KpiCard({ label, value, hint, delta = null, spark, highlight, index = 0 }: KpiCardProps) {
  return (
    <Surface
      padding="none"
      className={cn(
        "relative overflow-hidden p-5 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500",
        highlight && "border-accent/40",
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {highlight && (
        <div aria-hidden className="bg-accent-wash pointer-events-none absolute inset-0 opacity-70" />
      )}
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-text-secondary">{label}</p>
          {delta !== null && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                delta >= 0
                  ? "bg-state-success/12 text-state-success"
                  : "bg-state-danger/12 text-state-danger",
              )}
            >
              {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {delta >= 0 ? "+" : "−"}
              {formatPct(Math.abs(delta))}
            </span>
          )}
        </div>
        <p className="mt-3 font-display text-[34px] font-medium leading-none tracking-[-0.02em] tabular-nums text-text-primary">
          {value}
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          {hint ? <p className="text-[12.5px] text-text-tertiary">{hint}</p> : <span />}
          {spark && spark.length > 1 ? <Sparkline values={spark} /> : null}
        </div>
      </div>
    </Surface>
  );
}

/** Pure SVG — no chart runtime for a 30-point line. */
function Sparkline({ values }: { values: number[] }) {
  const w = 88;
  const h = 28;
  const max = Math.max(1, ...values);
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - 2 - (v / max) * (h - 4)] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0 overflow-visible">
      <path d={area} fill="var(--accent-soft)" />
      <path d={line} fill="none" stroke="var(--accent-bright)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
