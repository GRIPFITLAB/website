import "server-only";

import { priceExperiment } from "@/lib/admin";
import { listExperimentVisitors, listLeads, type LeadRow, type VisitorRow } from "@/lib/experiment/store";

import {
  armStats,
  breakdown,
  channelOf,
  dailySeries,
  summarize,
  type ArmStat,
  type BreakdownItem,
  type DailyPoint,
  type Kpis,
} from "./metrics";

export const ACTIVITY_DAYS = 30;

export interface DashboardData {
  /** `unconfigured` = no Firestore credentials; `error` = the read failed. */
  status: "ok" | "unconfigured" | "error";
  experimentId: string;
  experimentEnabled: boolean;
  generatedAt: number;
  arms: ArmStat[];
  daily: DailyPoint[];
  kpis: Kpis;
  sources: BreakdownItem[];
  channels: BreakdownItem[];
  subscribers: LeadRow[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const experimentId = priceExperiment.id;
  let visitors: VisitorRow[] = [];
  let leads: LeadRow[] = [];
  let status: DashboardData["status"] = "ok";

  try {
    const [v, l] = await Promise.all([listExperimentVisitors(experimentId), listLeads()]);
    if (v === null || l === null) status = "unconfigured";
    visitors = v ?? [];
    leads = l ?? [];
  } catch (error) {
    console.error("[admin] dashboard read failed", error);
    status = "error";
  }

  const now = Date.now();
  const arms = armStats(priceExperiment.arms, visitors, leads, experimentId);

  return {
    status,
    experimentId,
    experimentEnabled: priceExperiment.enabled,
    generatedAt: now,
    arms,
    daily: dailySeries(visitors, leads, ACTIVITY_DAYS, now),
    kpis: summarize(arms, leads, now),
    sources: breakdown(leads, (l) => l.firstSource ?? "Unknown"),
    channels: breakdown(leads, channelOf),
    subscribers: leads,
  };
}
