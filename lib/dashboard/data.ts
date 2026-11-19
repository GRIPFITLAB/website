import "server-only";

import { priceExperiment } from "@/lib/admin";
import { listLeads, listVisitors, type LeadRow, type VisitorRow } from "@/lib/experiment/store";

import {
  armStats,
  breakdown,
  channelOf,
  dailySeries,
  experimentOptions,
  inRange,
  parseDateRange,
  parseExperimentSelection,
  rangeBounds,
  summarize,
  type ArmStat,
  type BreakdownItem,
  type DailyPoint,
  type DateRange,
  type ExperimentOption,
  type Kpis,
} from "./metrics";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Activity chart span when no start date is chosen and data is sparse. */
const MIN_SERIES_DAYS = 30;

export type DashboardSearchParams = { [key: string]: string | string[] | undefined };

export interface DashboardData {
  /** `unconfigured` = no Firestore credentials; `error` = the read failed. */
  status: "ok" | "unconfigured" | "error";
  currentExperimentId: string;
  experimentEnabled: boolean;
  /** Every experiment seen in the data, for the filter. */
  experiments: ExperimentOption[];
  /** Selected experiment ids; `null` = no filter (everything). */
  selected: string[] | null;
  range: DateRange;
  generatedAt: number;
  arms: ArmStat[];
  daily: DailyPoint[];
  kpis: Kpis;
  sources: BreakdownItem[];
  channels: BreakdownItem[];
  subscribers: LeadRow[];
}

export async function getDashboardData(params: DashboardSearchParams): Promise<DashboardData> {
  const currentId = priceExperiment.id;
  let visitors: VisitorRow[] = [];
  let leads: LeadRow[] = [];
  let status: DashboardData["status"] = "ok";

  try {
    const [v, l] = await Promise.all([listVisitors(), listLeads()]);
    if (v === null || l === null) status = "unconfigured";
    visitors = v ?? [];
    leads = l ?? [];
  } catch (error) {
    console.error("[admin] dashboard read failed", error);
    status = "error";
  }

  const experiments = experimentOptions(currentId, visitors, leads);
  const selected = parseExperimentSelection(
    params.exp,
    experiments.map((e) => e.id),
  );
  const range = parseDateRange(params.from, params.to);
  const bounds = rangeBounds(range);

  // Exclusion follows the lead, wherever its signup falls in the range.
  const excludedVisitors = new Set(
    leads.filter((l) => l.excludedFromExperiment && l.visitorId).map((l) => l.visitorId!),
  );
  const inExperiments = (id: string | null) => selected === null || (id !== null && selected.includes(id));

  const scopedVisitors = visitors.filter(
    (v) =>
      inExperiments(v.experimentId) && inRange(v.firstSeenAt, bounds) && !excludedVisitors.has(v.visitorId),
  );
  const scopedLeads = leads.filter((l) => inExperiments(l.experimentId) && inRange(l.createdAt, bounds));

  const now = Date.now();
  const endMs = Math.min(bounds.endMs ?? now, now);
  let earliest = endMs - (MIN_SERIES_DAYS - 1) * DAY_MS;
  for (const v of scopedVisitors) if (v.firstSeenAt !== null && v.firstSeenAt < earliest) earliest = v.firstSeenAt;
  for (const l of scopedLeads) if (l.createdAt !== null && l.createdAt < earliest) earliest = l.createdAt;
  const startMs = bounds.startMs ?? earliest;

  const arms = armStats(
    { id: currentId, arms: priceExperiment.arms },
    scopedVisitors,
    scopedLeads,
    selected === null || selected.includes(currentId),
  );

  return {
    status,
    currentExperimentId: currentId,
    experimentEnabled: priceExperiment.enabled,
    experiments,
    selected,
    range,
    generatedAt: now,
    arms,
    daily: dailySeries(scopedVisitors, scopedLeads, startMs, Math.max(endMs, startMs + 1)),
    kpis: summarize(arms, scopedLeads, endMs),
    sources: breakdown(scopedLeads, (l) => l.firstSource ?? "Unknown"),
    channels: breakdown(scopedLeads, channelOf),
    subscribers: scopedLeads,
  };
}
