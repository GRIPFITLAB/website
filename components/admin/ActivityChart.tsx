"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyPoint } from "@/lib/dashboard/metrics";

import { formatDay } from "./format";

const AXIS_TICK = { fill: "var(--text-tertiary)", fontSize: 12 };

export function ActivityChart({ points }: { points: DailyPoint[] }) {
  const totals = points.reduce(
    (acc, p) => ({ visitors: acc.visitors + p.visitors, signups: acc.signups + p.signups }),
    { visitors: 0, signups: 0 },
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-text-secondary">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-accent" /> Visitors
          <span className="tabular-nums text-text-primary">{totals.visitors.toLocaleString("en-US")}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-chart-2" /> Subscribers
          <span className="tabular-nums text-text-primary">{totals.signups.toLocaleString("en-US")}</span>
        </span>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 0, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="gf-activity-visitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border-hairline)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              tick={AXIS_TICK}
              axisLine={{ stroke: "var(--border-default)" }}
              tickLine={false}
              tickMargin={10}
              minTickGap={24}
            />
            <YAxis yAxisId="visitors" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={44} />
            <YAxis yAxisId="signups" orientation="right" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
            <Tooltip
              cursor={{ fill: "var(--accent-soft)" }}
              content={({ active, payload }) => {
                const p = active ? (payload?.[0]?.payload as DailyPoint | undefined) : undefined;
                if (!p) return null;
                return (
                  <div className="min-w-[160px] rounded-xl border border-border-default bg-bg-raised/95 p-3 text-[12.5px] shadow-[var(--shadow-card)] backdrop-blur">
                    <p className="mb-1.5 font-medium text-text-primary">{formatDay(p.date)}</p>
                    <div className="flex justify-between gap-4">
                      <span className="text-text-tertiary">Visitors</span>
                      <span className="tabular-nums text-text-primary">{p.visitors}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-text-tertiary">Subscribers</span>
                      <span className="tabular-nums text-text-primary">{p.signups}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              yAxisId="signups"
              dataKey="signups"
              fill="var(--chart-2)"
              fillOpacity={0.55}
              radius={[4, 4, 0, 0]}
              maxBarSize={10}
            />
            <Area
              yAxisId="visitors"
              dataKey="visitors"
              type="monotone"
              stroke="var(--accent-bright)"
              strokeWidth={2}
              fill="url(#gf-activity-visitors)"
              activeDot={{ r: 4, fill: "var(--accent-bright)", stroke: "var(--bg-elevated)", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
