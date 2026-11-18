"use client";

import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Download, Search, Users } from "lucide-react";
import { useId, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import type { LeadRow } from "@/lib/experiment/store";
import { formatUSD } from "@/lib/pricing";
import { cn } from "@/lib/utils";

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
  { key: "createdAt", label: "Signed up", value: (r) => r.createdAt, render: (r) => formatDateTime(r.createdAt) },
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

const PAGE_SIZE = 25;

function compare(a: SortValue, b: SortValue): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function toCsv(rows: LeadRow[]): string {
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
    COLUMNS.map((c) => esc(c.label)).join(","),
    ...rows.map((r) => COLUMNS.map((c) => esc(exportValue(c, r))).join(",")),
  ].join("\n");
}

export function SubscribersPanel({ subscribers }: { subscribers: LeadRow[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "createdAt", dir: "desc" });
  const [page, setPage] = useState(0);
  const bodyId = useId();

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
    const col = COLUMNS.find((c) => c.key === sort.key) ?? COLUMNS[1]!;
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.value(a);
      const vb = col.value(b);
      // Blanks sink to the bottom in either direction.
      if (va === null || vb === null) return compare(va, vb);
      return sign * compare(va, vb);
    });
  }, [subscribers, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  function toggleSort(key: string) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    setPage(0);
  }

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gripfit-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search email, code, campaign…"
                  aria-label="Search subscribers"
                  className="h-10 pl-9"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] tabular-nums text-text-tertiary">
                  {filtered.length.toLocaleString("en-US")} result{filtered.length === 1 ? "" : "s"}
                </span>
                <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
                  <Download /> Export CSV
                </Button>
              </div>
            </div>

            <div className="max-h-[640px] overflow-auto border-t border-border-hairline">
              <table className="w-full min-w-max border-separate border-spacing-0 text-[13px]">
                <thead>
                  <tr>
                    {COLUMNS.map((c, i) => {
                      const active = sort.key === c.key;
                      return (
                        <th
                          key={c.key}
                          scope="col"
                          aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                          className={cn(
                            "sticky top-0 z-10 border-b border-border-default bg-bg-raised px-4 py-2.5 text-left font-medium text-text-secondary",
                            i === 0 && "left-0 z-20",
                            c.className,
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSort(c.key)}
                            className={cn(
                              "inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-text-primary",
                              active && "text-text-primary",
                            )}
                          >
                            {c.label}
                            {active ? (
                              sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                            ) : null}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="px-6 py-14 text-center text-text-tertiary">
                        {subscribers.length === 0 ? "No subscribers yet." : "No subscribers match that search."}
                      </td>
                    </tr>
                  ) : (
                    visible.map((r) => (
                      <tr key={r.id} className="group">
                        {COLUMNS.map((c, i) => {
                          const content = c.render ? c.render(r) : c.value(r);
                          return (
                            <td
                              key={c.key}
                              className={cn(
                                "whitespace-nowrap border-b border-border-hairline bg-bg-elevated px-4 py-2.5 text-text-secondary transition-colors group-hover:bg-bg-raised",
                                i === 0 && "sticky left-0 z-[1] font-medium text-text-primary",
                                c.mono && "font-mono text-[12px]",
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-between gap-3 border-t border-border-hairline px-4 py-3 text-[13px] text-text-tertiary md:px-6">
                <span className="tabular-nums">
                  {current * PAGE_SIZE + 1}–{Math.min(filtered.length, (current + 1) * PAGE_SIZE)} of{" "}
                  {filtered.length.toLocaleString("en-US")}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Previous page"
                    disabled={current === 0}
                    onClick={() => setPage(current - 1)}
                  >
                    <ChevronLeft />
                  </Button>
                  <span className="px-2 tabular-nums">
                    {current + 1} / {pageCount}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Next page"
                    disabled={current >= pageCount - 1}
                    onClick={() => setPage(current + 1)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Surface>
  );
}
