/**
 * Admin dashboard aggregation — pure functions over the rows
 * `lib/experiment/store.ts` reads, so they're testable without Firestore.
 * Callers pass rows already scoped to the selected experiments.
 *
 * Counting rules match `scripts/export-leads.mjs` (DECISIONS.md §17):
 * impressions are visitor docs; a signup counts only if it came from a
 * visitor assigned in an experiment (`isExperimentPrice`), keyed by the
 * arm the email is locked at. Leads excluded from `/admin` drop out,
 * together with their visitor's impression.
 *
 * Experiment arms are resolved to the prices they actually showed and
 * merged by Kickstarter price, so the demand curve stays meaningful when
 * several experiments (with different arm tables) are selected.
 */

import type { PriceArm } from "@/lib/admin";
import type { LeadRow, VisitorRow } from "@/lib/experiment/store";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ArmStat {
  /** Kickstarter price — one point on the demand curve. */
  key: number;
  /** The arm id, when every experiment in scope used the same one. */
  armId: number | null;
  experimentIds: string[];
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

export function isExperimentSignup(lead: LeadRow): boolean {
  return (
    lead.experimentId !== null &&
    lead.isExperimentPrice &&
    !lead.excludedFromExperiment &&
    lead.priceArm !== null
  );
}

interface ArmPrices {
  kickstarter: number;
  lock: number;
  retail: number;
}

export interface CurrentExperiment {
  id: string;
  arms: readonly PriceArm[];
}

export function armStats(
  current: CurrentExperiment,
  visitors: readonly VisitorRow[],
  leads: readonly LeadRow[],
  /** Show every current arm, even with no traffic yet. */
  includeCurrentArms: boolean,
): ArmStat[] {
  // (experiment, arm) → prices. The live config is authoritative for the
  // current experiment; older ones use what their visitor docs recorded.
  const prices = new Map<string, ArmPrices>();
  const armKey = (exp: string | null, arm: number) => `${exp ?? ""}\u0000${arm}`;
  for (const arm of current.arms) {
    prices.set(armKey(current.id, arm.id), {
      kickstarter: arm.kickstarterCeilingUSD,
      lock: arm.emailLockUSD,
      retail: arm.retailUSD,
    });
  }
  for (const v of visitors) {
    if (v.priceArm === null || v.kickstarterCeiling === null) continue;
    const k = armKey(v.experimentId, v.priceArm);
    if (prices.has(k)) continue;
    prices.set(k, {
      kickstarter: v.kickstarterCeiling,
      lock: v.emailLockPrice ?? 0,
      retail: v.expectedRetail ?? 0,
    });
  }

  interface Acc {
    prices: ArmPrices;
    armIds: Set<number>;
    experimentIds: Set<string>;
    impressions: number;
    signups: number;
  }
  const points = new Map<number, Acc>();
  const point = (exp: string | null, arm: number): Acc | null => {
    const p = prices.get(armKey(exp, arm));
    if (!p) return null;
    let acc = points.get(p.kickstarter);
    if (!acc) {
      acc = { prices: p, armIds: new Set(), experimentIds: new Set(), impressions: 0, signups: 0 };
      points.set(p.kickstarter, acc);
    }
    acc.armIds.add(arm);
    if (exp) acc.experimentIds.add(exp);
    return acc;
  };

  if (includeCurrentArms) {
    for (const arm of current.arms) point(current.id, arm.id);
  }

  // An excluded signup's impression goes too, or its arm's rate drops.
  const excludedVisitors = new Set(
    leads.filter((l) => l.excludedFromExperiment && l.visitorId).map((l) => l.visitorId!),
  );
  for (const v of visitors) {
    if (v.priceArm === null || excludedVisitors.has(v.visitorId)) continue;
    const acc = point(v.experimentId, v.priceArm);
    if (acc) acc.impressions += 1;
  }
  for (const l of leads) {
    if (!isExperimentSignup(l)) continue;
    const acc = point(l.experimentId, l.priceArm!);
    if (acc) acc.signups += 1;
  }

  return [...points.entries()]
    .sort(([a], [b]) => a - b)
    .map(([price, acc]) => {
      const n = acc.impressions;
      const s = acc.signups;
      const rate = n > 0 ? s / n : null;
      const ci = wilsonInterval(s, n);
      const armIds = [...acc.armIds];
      return {
        key: price,
        armId: armIds.length === 1 ? armIds[0]! : null,
        experimentIds: [...acc.experimentIds].sort(),
        kickstarterPrice: price,
        lockPrice: acc.prices.lock,
        retailPrice: acc.prices.retail,
        impressions: n,
        signups: s,
        rate,
        ciLow: ci?.[0] ?? null,
        ciHigh: ci?.[1] ?? null,
        revenueIndex: rate === null ? null : rate * 1000 * price,
      };
    });
}

export interface ExperimentOption {
  id: string;
  visitors: number;
  subscribers: number;
  isCurrent: boolean;
}

/** Every experiment id seen in the data, plus the live one; live first. */
export function experimentOptions(
  currentId: string,
  visitors: readonly VisitorRow[],
  leads: readonly LeadRow[],
): ExperimentOption[] {
  const map = new Map<string, ExperimentOption>();
  const get = (id: string) => {
    let o = map.get(id);
    if (!o) {
      o = { id, visitors: 0, subscribers: 0, isCurrent: id === currentId };
      map.set(id, o);
    }
    return o;
  };
  get(currentId);
  for (const v of visitors) if (v.experimentId) get(v.experimentId).visitors += 1;
  for (const l of leads) if (l.experimentId) get(l.experimentId).subscribers += 1;
  return [...map.values()].sort(
    (a, b) => Number(b.isCurrent) - Number(a.isCurrent) || b.id.localeCompare(a.id),
  );
}

/* ── Date range ──────────────────────────────────────────────────────── */

/** Inclusive UTC calendar days, `YYYY-MM-DD`; `null` = open-ended. */
export interface DateRange {
  from: string | null;
  to: string | null;
}

const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function isoDay(raw: string | string[] | undefined): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || !ISO_DAY_RE.test(v)) return null;
  const ms = Date.parse(`${v}T00:00:00Z`);
  return Number.isNaN(ms) || utcDay(ms) !== v ? null : v;
}

/** Validate `?from=` / `?to=`; a reversed pair is swapped. */
export function parseDateRange(
  fromRaw: string | string[] | undefined,
  toRaw: string | string[] | undefined,
): DateRange {
  const from = isoDay(fromRaw);
  const to = isoDay(toRaw);
  if (from && to && from > to) return { from: to, to: from };
  return { from, to };
}

/** Half-open millisecond bounds: `[startMs, endMs)`. */
export function rangeBounds(range: DateRange): { startMs: number | null; endMs: number | null } {
  return {
    startMs: range.from ? Date.parse(`${range.from}T00:00:00Z`) : null,
    endMs: range.to ? Date.parse(`${range.to}T00:00:00Z`) + DAY_MS : null,
  };
}

/** A row with no timestamp is outside every bounded range. */
export function inRange(
  ms: number | null,
  { startMs, endMs }: { startMs: number | null; endMs: number | null },
): boolean {
  if (startMs === null && endMs === null) return true;
  if (ms === null) return false;
  return (startMs === null || ms >= startMs) && (endMs === null || ms < endMs);
}

/**
 * Normalise the `?exp=` selection: known ids only, de-duplicated. An
 * empty result means "no filter" (`null`).
 */
export function parseExperimentSelection(
  raw: string | string[] | undefined,
  known: readonly string[],
): string[] | null {
  const values = (Array.isArray(raw) ? raw : raw ? [raw] : []).flatMap((v) => v.split(","));
  const picked = [...new Set(values.map((v) => v.trim()))].filter((v) => known.includes(v));
  return picked.length > 0 ? picked : null;
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

/** Longest span the activity chart draws, in days. */
export const MAX_SERIES_DAYS = 366;

/** Every UTC day from `startMs` to `endMs` (exclusive), oldest first,
 *  zero-filled. Clipped to the last {@link MAX_SERIES_DAYS} days. */
export function dailySeries(
  visitors: readonly VisitorRow[],
  leads: readonly LeadRow[],
  startMs: number,
  endMs: number,
): DailyPoint[] {
  const lastDay = Date.parse(`${utcDay(endMs - 1)}T00:00:00Z`);
  const firstDay = Math.max(
    Date.parse(`${utcDay(startMs)}T00:00:00Z`),
    lastDay - (MAX_SERIES_DAYS - 1) * DAY_MS,
  );
  const points = new Map<string, DailyPoint>();
  for (let t = firstDay; t <= lastDay; t += DAY_MS) {
    const date = utcDay(t);
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
