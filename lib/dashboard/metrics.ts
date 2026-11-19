/**
 * Admin dashboard aggregation — pure functions over the rows
 * `lib/experiment/store.ts` reads, so they're testable without Firestore.
 *
 * Counting rules match `scripts/export-leads.mjs` (DECISIONS.md §17):
 * impressions are visitor docs in the current experiment; a signup counts
 * toward an arm only if it came from a visitor assigned in this experiment
 * (`isExperimentPrice`), keyed by the arm the email is locked at. Leads
 * excluded from `/admin` drop out, together with their visitor's impression.
 */

import type { PriceArm } from "@/lib/admin";
import type { LeadRow, VisitorRow } from "@/lib/experiment/store";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ArmStat {
  armId: number;
  kickstarterPrice: number;
  lockPrice: number;
  retailPrice: number;
  impressions: number;
  signups: number;
  /** Signups ÷ impressions, 0–1. `null` with no impressions. */
  rate: number | null;
  /** Wilson 95% interval on `rate`. */
  ciLow: number | null;
  ciHigh: number | null;
  /** Expected signups per 1,000 visitors × Kickstarter price — the demand
   *  curve's revenue view. `null` with no impressions. */
  revenueIndex: number | null;
}

/** Wilson score interval — sane at small n and at 0 / n successes. */
export function wilsonInterval(successes: number, n: number, z = 1.96): [number, number] | null {
  if (n <= 0) return null;
  const p = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return [Math.max(0, centre - margin), Math.min(1, centre + margin)];
}

export function isExperimentSignup(lead: LeadRow, experimentId: string): boolean {
  return (
    lead.experimentId === experimentId &&
    lead.isExperimentPrice &&
    !lead.excludedFromExperiment &&
    lead.priceArm !== null
  );
}

export function armStats(
  arms: readonly PriceArm[],
  visitors: readonly VisitorRow[],
  leads: readonly LeadRow[],
  experimentId: string,
): ArmStat[] {
  // An excluded signup's impression goes too, or its arm's rate drops.
  const excludedVisitors = new Set(
    leads.filter((l) => l.excludedFromExperiment && l.visitorId).map((l) => l.visitorId!),
  );
  const impressions = new Map<number, number>();
  for (const v of visitors) {
    if (v.priceArm === null || excludedVisitors.has(v.visitorId)) continue;
    impressions.set(v.priceArm, (impressions.get(v.priceArm) ?? 0) + 1);
  }
  const signups = new Map<number, number>();
  for (const l of leads) {
    if (!isExperimentSignup(l, experimentId)) continue;
    signups.set(l.priceArm!, (signups.get(l.priceArm!) ?? 0) + 1);
  }

  return arms.map((arm) => {
    const n = impressions.get(arm.id) ?? 0;
    const s = signups.get(arm.id) ?? 0;
    const rate = n > 0 ? s / n : null;
    const ci = wilsonInterval(s, n);
    return {
      armId: arm.id,
      kickstarterPrice: arm.kickstarterCeilingUSD,
      lockPrice: arm.emailLockUSD,
      retailPrice: arm.retailUSD,
      impressions: n,
      signups: s,
      rate,
      ciLow: ci?.[0] ?? null,
      ciHigh: ci?.[1] ?? null,
      revenueIndex: rate === null ? null : rate * 1000 * arm.kickstarterCeilingUSD,
    };
  });
}

export interface DailyPoint {
  /** `YYYY-MM-DD`, UTC. */
  date: string;
  visitors: number;
  signups: number;
}

function utcDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** The last `days` UTC days, oldest first, zero-filled. */
export function dailySeries(
  visitors: readonly VisitorRow[],
  leads: readonly LeadRow[],
  days: number,
  nowMs: number = Date.now(),
): DailyPoint[] {
  const points = new Map<string, DailyPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const date = utcDay(nowMs - i * DAY_MS);
    points.set(date, { date, visitors: 0, signups: 0 });
  }
  for (const v of visitors) {
    if (v.firstSeenAt === null) continue;
    const p = points.get(utcDay(v.firstSeenAt));
    if (p) p.visitors += 1;
  }
  for (const l of leads) {
    if (l.createdAt === null) continue;
    const p = points.get(utcDay(l.createdAt));
    if (p) p.signups += 1;
  }
  return [...points.values()];
}

export interface BreakdownItem {
  label: string;
  count: number;
}

/** Top `limit` values of `key`, the rest folded into "Other". */
export function breakdown(
  leads: readonly LeadRow[],
  key: (lead: LeadRow) => string,
  limit = 5,
): BreakdownItem[] {
  const counts = new Map<string, number>();
  for (const l of leads) {
    const k = key(l);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const sorted = [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  if (sorted.length <= limit) return sorted;
  const head = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((sum, item) => sum + item.count, 0);
  return [...head, { label: "Other", count: rest }];
}

/** Where a lead came from: ad source, else referring site, else direct. */
export function channelOf(lead: LeadRow): string {
  return lead.utmSource ?? lead.referrerHost ?? "Direct";
}

export interface Kpis {
  totalSubscribers: number;
  last7Days: number;
  prior7Days: number;
  impressions: number;
  experimentSignups: number;
  /** Pooled signup rate across arms, 0–1. */
  overallRate: number | null;
  /** Arm with the highest revenue index (needs ≥ 1 impression). */
  bestArm: ArmStat | null;
}

export function summarize(
  stats: readonly ArmStat[],
  leads: readonly LeadRow[],
  nowMs: number = Date.now(),
): Kpis {
  const weekAgo = nowMs - 7 * DAY_MS;
  const twoWeeksAgo = nowMs - 14 * DAY_MS;
  let last7Days = 0;
  let prior7Days = 0;
  for (const l of leads) {
    if (l.createdAt === null) continue;
    if (l.createdAt > weekAgo) last7Days += 1;
    else if (l.createdAt > twoWeeksAgo) prior7Days += 1;
  }
  const impressions = stats.reduce((sum, a) => sum + a.impressions, 0);
  const experimentSignups = stats.reduce((sum, a) => sum + a.signups, 0);
  const bestArm = stats
    .filter((a) => a.revenueIndex !== null)
    .reduce<ArmStat | null>(
      (best, a) => (best === null || a.revenueIndex! > best.revenueIndex! ? a : best),
      null,
    );
  return {
    totalSubscribers: leads.length,
    last7Days,
    prior7Days,
    impressions,
    experimentSignups,
    overallRate: impressions > 0 ? experimentSignups / impressions : null,
    bestArm: bestArm && bestArm.signups > 0 ? bestArm : null,
  };
}
