import { ArrowUpRight, LogOut, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { Eyebrow, Meta } from "@/components/ui/typography";
import { ACTIVITY_DAYS, type DashboardData } from "@/lib/dashboard/data";
import { ADMIN_PATH } from "@/lib/dashboard/session";
import { formatUSD } from "@/lib/pricing";
import { cn } from "@/lib/utils";

import { ActivityChart } from "./ActivityChart";
import { signOutAdmin } from "./admin-actions";
import { BreakdownList } from "./BreakdownList";
import { DemandCurveChart } from "./DemandCurveChart";
import { formatPct } from "./format";
import { KpiCard } from "./KpiCard";
import { SubscribersPanel } from "./SubscribersPanel";

export function Dashboard({ data }: { data: DashboardData }) {
  const { kpis, arms } = data;
  const weekDelta =
    kpis.prior7Days > 0 ? (kpis.last7Days - kpis.prior7Days) / kpis.prior7Days : null;
  const totalSignups = kpis.experimentSignups;
  const updated = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(data.generatedAt);

  return (
    <div className="relative min-h-dvh">
      <div aria-hidden className="bg-accent-wash pointer-events-none absolute inset-x-0 top-0 h-[480px]" />

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border-hairline bg-bg-deep/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Logo asLink={false} size={16} />
            <span className="rounded-full border border-border-default bg-bg-raised px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<a href="/" target="_blank" rel="noreferrer" />}
              className="hidden text-text-secondary sm:inline-flex"
            >
              View site <ArrowUpRight />
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={ADMIN_PATH} prefetch={false} />}
            >
              <RefreshCw /> Refresh
            </Button>
            <form action={signOutAdmin}>
              <Button type="submit" variant="ghost" size="sm" className="text-text-secondary">
                <LogOut /> <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex max-w-[1400px] flex-col gap-6 px-5 pb-20 pt-10 md:px-8">
        {/* ── Title ─────────────────────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Eyebrow className="mb-3">Pre-launch demand</Eyebrow>
            <h1 className="font-display text-display-lg text-text-primary">Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-text-tertiary">
            <Chip>
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  data.experimentEnabled ? "bg-state-success" : "bg-text-disabled",
                )}
              />
              {data.experimentEnabled ? "Experiment live" : "Experiment off"}
            </Chip>
            <Chip>
              <span className="font-mono text-[12px]">{data.experimentId}</span>
            </Chip>
            <span>Updated {updated} UTC</span>
          </div>
        </div>

        {data.status !== "ok" && <StatusBanner status={data.status} />}

        {/* ── KPIs ──────────────────────────────────────────────────── */}
        <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            index={0}
            label="Email subscribers"
            value={kpis.totalSubscribers.toLocaleString("en-US")}
            delta={weekDelta}
            hint={`${kpis.last7Days.toLocaleString("en-US")} in the last 7 days`}
            spark={data.daily.map((d) => d.signups)}
          />
          <KpiCard
            index={1}
            label="Visitors in experiment"
            value={kpis.impressions.toLocaleString("en-US")}
            hint={`Across ${arms.length} price arms`}
            spark={data.daily.map((d) => d.visitors)}
          />
          <KpiCard
            index={2}
            label="Signup rate"
            value={kpis.overallRate === null ? "—" : formatPct(kpis.overallRate)}
            hint={`${totalSignups.toLocaleString("en-US")} experiment signups`}
          />
          <KpiCard
            index={3}
            label="Revenue-optimal price"
            value={kpis.bestArm ? formatUSD(kpis.bestArm.kickstarterPrice) : "—"}
            hint={
              kpis.bestArm
                ? `Arm ${kpis.bestArm.armId} · ${formatPct(kpis.bestArm.rate ?? 0)} signup rate`
                : "Waiting for signups"
            }
            highlight
          />
        </section>

        {/* ── Demand curve + arms ──────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel
            className="xl:col-span-2"
            title="Demand curve"
            description="Signup rate at each Kickstarter price, with 95% confidence band. The dashed line is revenue per 1,000 visitors."
          >
            <DemandCurveChart arms={arms} />
          </Panel>

          <Panel title="Price arms" description="Impressions → signups, per arm.">
            <ArmList data={data} />
          </Panel>
        </section>

        {/* ── Activity + sources ───────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel
            className="xl:col-span-2"
            title="Activity"
            description={`New visitors and subscribers per day, last ${ACTIVITY_DAYS} days (UTC).`}
          >
            <ActivityChart points={data.daily} />
          </Panel>
          <Panel title="Where signups come from" description="All subscribers, first touch.">
            <div className="flex flex-col gap-7">
              <BreakdownList title="Signup surface" items={data.sources} total={kpis.totalSubscribers} />
              <BreakdownList title="Channel" items={data.channels} total={kpis.totalSubscribers} />
            </div>
          </Panel>
        </section>

        {/* ── Subscribers ──────────────────────────────────────────── */}
        <SubscribersPanel subscribers={data.subscribers} />
      </main>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border-hairline bg-bg-elevated px-3 py-1 text-text-secondary">
      {children}
    </span>
  );
}

function StatusBanner({ status }: { status: "unconfigured" | "error" }) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-state-warning/30 bg-state-warning/10 px-5 py-4 text-sm leading-[1.6] text-state-warning"
    >
      {status === "unconfigured" ? (
        <>
          <strong className="font-semibold">Database not connected.</strong> Set{" "}
          <code className="font-mono">FIREBASE_SERVICE_ACCOUNT_JSON</code> on this deployment to load
          visitors and subscribers.
        </>
      ) : (
        <>
          <strong className="font-semibold">Couldn’t read the database.</strong> Firestore returned an
          error — check the function logs, then refresh.
        </>
      )}
    </div>
  );
}

function Panel({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Surface padding="none" className={cn("flex flex-col p-5 md:p-6", className)}>
      <div className="mb-5">
        <h2 className="font-display text-display-sm text-text-primary">{title}</h2>
        {description ? <Meta className="mt-1">{description}</Meta> : null}
      </div>
      <div className="flex-1">{children}</div>
    </Surface>
  );
}

function ArmList({ data }: { data: DashboardData }) {
  const best = data.kpis.bestArm?.armId ?? null;
  const maxRate = Math.max(0, ...data.arms.map((a) => a.rate ?? 0));
  return (
    <ul className="flex flex-col divide-y divide-border-hairline">
      {data.arms.map((arm) => {
        const width = maxRate > 0 && arm.rate !== null ? (arm.rate / maxRate) * 100 : 0;
        return (
          <li key={arm.armId} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] font-medium text-text-tertiary">Arm {arm.armId}</span>
                <span className="font-display text-[17px] font-medium tabular-nums text-text-primary">
                  {formatUSD(arm.kickstarterPrice)}
                </span>
                {best === arm.armId && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-bright">
                    Best
                  </span>
                )}
              </div>
              <span className="font-display text-[17px] font-medium tabular-nums text-text-primary">
                {arm.rate === null ? "—" : formatPct(arm.rate)}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-raised">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent-bright transition-[width] duration-700"
                style={{ width: `${width}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[12px] tabular-nums text-text-tertiary">
              <span>
                Lock {formatUSD(arm.lockPrice)} · Retail {formatUSD(arm.retailPrice)}
              </span>
              <span>
                {arm.signups.toLocaleString("en-US")} / {arm.impressions.toLocaleString("en-US")}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
