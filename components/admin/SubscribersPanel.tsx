"use client";

import { ArrowDown, ArrowUp, ChevronDown, Download, Search, Users } from "lucide-react";
import { useId, useMemo, useState, useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import type { LeadRow } from "@/lib/experiment/store";
import { formatUSD } from "@/lib/pricing";
import { cn } from "@/lib/utils";

import { setSubscriberExcluded } from "./admin-actions";
import { formatDateTime } from "./format";

type SortValue = string | number | null;

interface Column {
  key: string;
  label: string;
  value: (r: LeadRow) => SortValue;
  render?: (r: LeadRow) => ReactNode;
  className?: string;
  mono?: boolean;
}

const COLUMNS: Column[] = [
  { key: "email", label: "Email", value: (r) => r.email },
  {
    key: "lockedPrice",
    label: "Locked price",
    value: (r) => r.lockedPrice,
    render: (r) => (r.lockedPrice === null ? null : formatUSD(r.lockedPrice)),
    className: "text-right",
  },
  { key: "priceArm", label: "Arm", value: (r) => r.priceArm, className: "text-right" },
  { key: "discountCode", label: "Code", value: (r) => r.discountCode, mono: true },
  { key: "firstSource", label: "First surface", value: (r) => r.firstSource },
  { key: "lastSource", label: "Last surface", value: (r) => r.lastSource },
  { key: "submitCount", label: "Submits", value: (r) => r.submitCount, className: "text-right" },
  { key: "createdAt", label: "Signed up", value: (r) => r.createdAt, render: (r) => formatDateTime(r.createdAt) },
  {
    key: "lastSubmittedAt",
    label: "Last activity",
    value: (r) => r.lastSubmittedAt,
    render: (r) => formatDateTime(r.lastSubmittedAt),
  },
  { key: "utmSource", label: "UTM source", value: (r) => r.utmSource },
  { key: "utmMedium", label: "UTM medium", value: (r) => r.utmMedium },
  { key: "utmCampaign", label: "UTM campaign", value: (r) => r.utmCampaign },
  { key: "utmContent", label: "UTM content", value: (r) => r.utmContent },
  { key: "campaignId", label: "Campaign ID", value: (r) => r.campaignId, mono: true },
  { key: "adsetId", label: "Ad set ID", value: (r) => r.adsetId, mono: true },
  { key: "adId", label: "Ad ID", value: (r) => r.adId, mono: true },
  { key: "placement", label: "Placement", value: (r) => r.placement },
  { key: "landingPath", label: "Landing page", value: (r) => r.landingPath, mono: true },
  { key: "referrerHost", label: "Referrer", value: (r) => r.referrerHost },
  {
    key: "isExperimentPrice",
    label: "In experiment",
    value: (r) => (r.isExperimentPrice ? 1 : 0),
    render: (r) => (r.isExperimentPrice ? "Yes" : "No"),
  },
  { key: "experimentId", label: "Experiment", value: (r) => r.experimentId, mono: true },
  { key: "visitorId", label: "Visitor ID", value: (r) => r.visitorId, mono: true },
];

const EXCLUDE_KEY = "excluded";

function compare(a: SortValue, b: SortValue): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function toCsv(rows: LeadRow[], isExcluded: (r: LeadRow) => boolean): string {
  const esc = (v: SortValue) => {
    const s = v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const exportValue = (c: Column, r: LeadRow): SortValue => {
    const v = c.value(r);
    if ((c.key === "createdAt" || c.key === "lastSubmittedAt") && typeof v === "number") {
      return new Date(v).toISOString();
    }
    return v;
  };
  return [
    ["Excluded", ...COLUMNS.map((c) => c.label)].map(esc).join(","),
    ...rows.map((r) =>
      [isExcluded(r) ? "Yes" : "No", ...COLUMNS.map((c) => exportValue(c, r))].map(esc).join(","),
    ),
  ].join("\n");
}

export function SubscribersPanel({ subscribers }: { subscribers: LeadRow[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "createdAt", dir: "desc" });
  /** Optimistic exclusion state until the server refresh lands. */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const bodyId = useId();

  const isExcluded = (r: LeadRow) => overrides[r.id] ?? r.excludedFromExperiment;
  const excludedCount = subscribers.filter(isExcluded).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q
      ? subscribers.filter((r) =>
          COLUMNS.some((c) => {
            const v = c.value(r);
            return typeof v === "string" && v.toLowerCase().includes(q);
          }),
        )
      : subscribers;
    const value =
      sort.key === EXCLUDE_KEY
        ? (r: LeadRow) => ((overrides[r.id] ?? r.excludedFromExperiment) ? 1 : 0)
        : (COLUMNS.find((c) => c.key === sort.key) ?? COLUMNS[0]!).value;
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      // Blanks sink to the bottom in either direction.
      if (va === null || vb === null) return compare(va, vb);
      return sign * compare(va, vb);
    });
  }, [subscribers, query, sort, overrides]);

  function toggleSort(key: string) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  function toggleExcluded(r: LeadRow, excluded: boolean) {
    setError(null);
    setOverrides((o) => ({ ...o, [r.id]: excluded }));
    startTransition(async () => {
      const result = await setSubscriberExcluded(r.id, excluded);
      if (!result.ok) {
        setError(`Couldn’t update ${r.email}. Refresh and try again.`);
      }
      setOverrides((o) => {
        const next = { ...o };
        delete next[r.id];
        return next;
      });
    });
  }

  function exportCsv() {
    const blob = new Blob([toCsv(filtered, isExcluded)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gripfit-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const headerCell =
    "sticky top-0 z-10 border-b border-border-default bg-bg-raised px-4 py-2.5 text-left font-medium text-text-secondary";

  return (
    <Surface padding="none" className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-bg-raised/40 focus-visible:bg-bg-raised/40 focus-visible:outline-none md:p-6"
      >
        <span className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent-bright">
            <Users className="size-5" />
          </span>
          <span>
            <span className="flex items-center gap-2">
              <span className="font-display text-display-sm text-text-primary">Email subscribers</span>
              <span className="rounded-full bg-bg-raised px-2 py-0.5 text-[12px] font-semibold tabular-nums text-text-secondary">
                {subscribers.length.toLocaleString("en-US")}
              </span>
            </span>
            <span className="mt-0.5 block text-[13px] text-text-tertiary">
              {open ? "Click to collapse" : "Expand to view every subscriber with signup and attribution metadata"}
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn("size-5 shrink-0 text-text-secondary transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      <div
        id={bodyId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        inert={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-border-hairline">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search email, code, campaign…"
                  aria-label="Search subscribers"
                  className="h-10 pl-9"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] tabular-nums text-text-tertiary">
                  {filtered.length.toLocaleString("en-US")} result{filtered.length === 1 ? "" : "s"}
                  {excludedCount > 0 && ` · ${excludedCount.toLocaleString("en-US")} excluded from experiment`}
                </span>
                <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
                  <Download /> Export CSV
                </Button>
              </div>
            </div>

            {error && (
              <p role="alert" className="mx-4 mb-3 rounded-lg border border-state-danger/30 bg-state-danger/10 px-3 py-2 text-[13px] text-state-danger md:mx-6">
                {error}
              </p>
            )}

            <div className="max-h-[75vh] overflow-auto border-t border-border-hairline">
              <table className="w-full min-w-max border-separate border-spacing-0 text-[13px]">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      aria-sort={sort.key === EXCLUDE_KEY ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                      className={cn(headerCell, "left-0 z-20 w-24 min-w-24")}
                    >
                      <SortButton
                        label="Exclude"
                        title="Excluded subscribers (and their visit) don’t count toward the price experiment"
                        active={sort.key === EXCLUDE_KEY}
                        dir={sort.dir}
                        onClick={() => toggleSort(EXCLUDE_KEY)}
                      />
                    </th>
                    {COLUMNS.map((c, i) => {
                      const active = sort.key === c.key;
                      return (
                        <th
                          key={c.key}
                          scope="col"
                          aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                          className={cn(headerCell, i === 0 && "left-24 z-20", c.className)}
                        >
                          <SortButton label={c.label} active={active} dir={sort.dir} onClick={() => toggleSort(c.key)} />
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} className="px-6 py-14 text-center text-text-tertiary">
                        {subscribers.length === 0 ? "No subscribers yet." : "No subscribers match that search."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const excluded = isExcluded(r);
                      const cell =
                        "whitespace-nowrap border-b border-border-hairline bg-bg-elevated px-4 py-2.5 transition-colors group-hover:bg-bg-raised";
                      return (
                        <tr key={r.id} className="group">
                          <td className={cn(cell, "sticky left-0 z-[1] w-24 min-w-24")}>
                            <input
                              type="checkbox"
                              checked={excluded}
                              onChange={(e) => toggleExcluded(r, e.target.checked)}
                              aria-label={`Exclude ${r.email} from the experiment`}
                              className="size-4 accent-accent"
                            />
                          </td>
                          {COLUMNS.map((c, i) => {
                            const content = c.render ? c.render(r) : c.value(r);
                            return (
                              <td
                                key={c.key}
                                className={cn(
                                  cell,
                                  "text-text-secondary",
                                  i === 0 && "sticky left-24 z-[1] font-medium text-text-primary",
                                  c.mono && "font-mono text-[12px]",
                                  excluded && "text-text-disabled",
                                  c.className,
                                )}
                              >
                                {content === null || content === "" ? (
                                  <span className="text-text-disabled">—</span>
                                ) : (
                                  content
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Surface>
  );
}

function SortButton({
  label,
  title,
  active,
  dir,
  onClick,
}: {
  label: string;
  title?: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-text-primary",
        active && "text-text-primary",
      )}
    >
      {label}
      {active ? dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : null}
    </button>
  );
}
