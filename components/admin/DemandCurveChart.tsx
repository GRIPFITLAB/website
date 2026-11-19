"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ArmStat } from "@/lib/dashboard/metrics";
import { formatUSD } from "@/lib/pricing";

import { formatPct } from "./format";

interface Datum {
  price: number;
  armId: number | null;
  experimentIds: string[];
  lock: number;
  retail: number;
  impressions: number;
  signups: number;
  /** Percent, 0–100. */
  rate: number | null;
  band: [number, number] | null;
  revenue: number | null;
}

const AXIS_TICK = { fill: "var(--text-tertiary)", fontSize: 12 };

export function DemandCurveChart({ arms }: { arms: ArmStat[] }) {
  const data: Datum[] = arms
    .map((a) => ({
      price: a.kickstarterPrice,
      armId: a.armId,
      experimentIds: a.experimentIds,
      lock: a.lockPrice,
      retail: a.retailPrice,
      impressions: a.impressions,
      signups: a.signups,
      rate: a.rate === null ? null : a.rate * 100,
      band: a.ciLow === null || a.ciHigh === null ? null : ([a.ciLow * 100, a.ciHigh * 100] as [number, number]),
      revenue: a.revenueIndex,
    }))
    .sort((x, y) => x.price - y.price);

  const hasData = data.some((d) => d.impressions > 0);
  const prices = data.map((d) => d.price);
  const lo = prices.length > 0 ? Math.min(...prices) : 0;
  const hi = prices.length > 0 ? Math.max(...prices) : 100;
  const pad = Math.max(5, Math.round((hi - lo) * 0.06));

  return (
    <div className="relative">
      <Legend />
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 4, bottom: 4, left: -8 }}>
            <defs>
              <linearGradient id="gf-demand-band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border-hairline)" vertical={false} />
            <XAxis
              dataKey="price"
              type="number"
              domain={[Math.max(0, lo - pad), hi + pad]}
              ticks={prices}
              tickFormatter={(v: number) => formatUSD(v)}
              tick={AXIS_TICK}
              axisLine={{ stroke: "var(--border-default)" }}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              yAxisId="rate"
              tickFormatter={(v: number) => `${Number(v.toFixed(1))}%`}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={52}
              allowDecimals
            />
            <YAxis
              yAxisId="revenue"
              orientation="right"
              tickFormatter={(v: number) => formatUSD(Math.round(v))}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              cursor={{ stroke: "var(--border-strong)", strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                const d = active ? (payload?.[0]?.payload as Datum | undefined) : undefined;
                return d ? <DemandTooltip d={d} /> : null;
              }}
            />
            <Area
              yAxisId="rate"
              dataKey="band"
              type="monotone"
              stroke="none"
              fill="url(#gf-demand-band)"
              connectNulls
              isAnimationActive
              activeDot={false}
            />
            <Line
              yAxisId="revenue"
              dataKey="revenue"
              type="monotone"
              stroke="var(--chart-2)"
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={false}
              activeDot={{ r: 4, fill: "var(--chart-2)", stroke: "var(--bg-elevated)", strokeWidth: 2 }}
              connectNulls
            />
            <Line
              yAxisId="rate"
              dataKey="rate"
              type="monotone"
              stroke="var(--accent-bright)"
              strokeWidth={2.5}
              dot={{ r: 4.5, fill: "var(--bg-elevated)", stroke: "var(--accent-bright)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "var(--accent-bright)", stroke: "var(--bg-elevated)", strokeWidth: 2 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {!hasData && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center pt-8">
          <p className="rounded-full border border-border-hairline bg-bg-elevated/90 px-4 py-2 text-[13px] text-text-secondary">
            The curve fills in as visitors arrive.
          </p>
        </div>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-text-secondary">
      <span className="inline-flex items-center gap-2">
        <span className="h-0.5 w-4 rounded-full bg-accent-bright" /> Signup rate
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-2.5 w-4 rounded-sm bg-accent/30" /> 95% confidence
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="w-4 border-t-2 border-dashed border-chart-2" /> Revenue / 1k visitors
      </span>
    </div>
  );
}

function DemandTooltip({ d }: { d: Datum }) {
  return (
    <div className="min-w-[200px] rounded-xl border border-border-default bg-bg-raised/95 p-3 text-[12.5px] shadow-[var(--shadow-card)] backdrop-blur">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="font-display text-[15px] font-medium text-text-primary">{formatUSD(d.price)}</span>
        <span className="text-text-tertiary">{d.armId === null ? "Mixed arms" : `Arm ${d.armId}`}</span>
      </div>
      <Row label="Signup rate" value={d.rate === null ? "—" : formatPct(d.rate / 100)} />
      <Row
        label="95% interval"
        value={d.band ? `${formatPct(d.band[0] / 100)} – ${formatPct(d.band[1] / 100)}` : "—"}
      />
      <Row label="Revenue / 1k" value={d.revenue === null ? "—" : formatUSD(Math.round(d.revenue))} />
      <Row label="Signups / visitors" value={`${d.signups} / ${d.impressions}`} />
      <div className="mt-2 border-t border-border-hairline pt-2 text-text-tertiary">
        Lock {formatUSD(d.lock)} · Retail {formatUSD(d.retail)}
        {d.experimentIds.length > 1 && (
          <span className="mt-1 block font-mono text-[11px]">{d.experimentIds.join(", ")}</span>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-text-tertiary">{label}</span>
      <span className="tabular-nums text-text-primary">{value}</span>
    </div>
  );
}
