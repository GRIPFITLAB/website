"use client";

import { Popover } from "@base-ui/react/popover";
import { CalendarRange, ChevronDown, FlaskConical, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DateRange, ExperimentOption } from "@/lib/dashboard/metrics";
import { ADMIN_PATH } from "@/lib/dashboard/session";
import { cn } from "@/lib/utils";

import { adminHref } from "./format";

const DAY_MS = 24 * 60 * 60 * 1000;

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - (days - 1) * DAY_MS).toISOString().slice(0, 10);
}

function shortDay(iso: string, withYear = false): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

function rangeLabel(range: DateRange): string {
  if (!range.from && !range.to) return "All time";
  if (range.from && !range.to) {
    const preset = PRESETS.find((p) => isoDaysAgo(p.days) === range.from);
    return preset ? preset.label : `Since ${shortDay(range.from, true)}`;
  }
  if (!range.from && range.to) return `Through ${shortDay(range.to, true)}`;
  return `${shortDay(range.from!)} – ${shortDay(range.to!, true)}`;
}

export interface FilterBarProps {
  experiments: ExperimentOption[];
  selected: string[] | null;
  range: DateRange;
}

export function FilterBar({ experiments, selected, range }: FilterBarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function go(next: { selected?: string[] | null; range?: DateRange }) {
    const href = adminHref(ADMIN_PATH, next.selected !== undefined ? next.selected : selected, next.range ?? range);
    startTransition(() => router.push(href, { scroll: false }));
  }

  const filtered = selected !== null || range.from !== null || range.to !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ExperimentPicker experiments={experiments} selected={selected} onApply={(s) => go({ selected: s })} />
      <DatePicker range={range} onApply={(r) => go({ range: r })} />
      {filtered && (
        <Button
          variant="ghost"
          size="sm"
          className="text-text-secondary"
          onClick={() => go({ selected: null, range: { from: null, to: null } })}
        >
          <X /> Reset
        </Button>
      )}
      <span aria-live="polite" className="inline-flex size-5 items-center justify-center">
        {pending ? <Loader2 className="size-4 animate-spin text-accent-bright" aria-label="Updating" /> : null}
      </span>
    </div>
  );
}

function TriggerButton({ icon, label, active }: { icon: ReactNode; label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
        active
          ? "border-accent/50 bg-accent-soft text-text-primary"
          : "border-border-default bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary",
      )}
    >
      {icon}
      <span className="max-w-[260px] truncate">{label}</span>
      <ChevronDown className="size-3.5 opacity-70" />
    </span>
  );
}

const popupClass =
  "z-50 w-[min(92vw,340px)] origin-[var(--transform-origin)] rounded-2xl border border-border-default bg-bg-raised p-2 shadow-[var(--shadow-card)] outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0";

function ExperimentPicker({
  experiments,
  selected,
  onApply,
}: {
  experiments: ExperimentOption[];
  selected: string[] | null;
  onApply: (selected: string[] | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected ?? []);

  const label =
    selected === null
      ? "All experiments"
      : selected.length === 1
        ? selected[0]!
        : `${selected.length} experiments`;

  function toggle(id: string) {
    setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(selected ?? []);
        setOpen(next);
      }}
    >
      <Popover.Trigger
        aria-label={`Experiment filter: ${label}`}
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <TriggerButton icon={<FlaskConical className="size-4" />} label={label} active={selected !== null} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start">
          <Popover.Popup className={popupClass}>
            <Popover.Title className="px-2 pb-1 pt-1.5 text-eyebrow text-text-tertiary">Experiments</Popover.Title>
            <Popover.Description className="px-2 pb-2 text-[12.5px] text-text-tertiary">
              None selected shows everything.
            </Popover.Description>
            <ul className="max-h-[280px] overflow-auto">
              {experiments.map((e) => {
                const checked = draft.includes(e.id);
                return (
                  <li key={e.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-bg-elevated">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(e.id)}
                        className="size-4 shrink-0 accent-accent"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-mono text-[12.5px] text-text-primary">{e.id}</span>
                          {e.isCurrent && (
                            <span className="rounded-full bg-state-success/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-state-success">
                              Live
                            </span>
                          )}
                        </span>
                        <span className="block text-[12px] tabular-nums text-text-tertiary">
                          {e.visitors.toLocaleString("en-US")} visitors · {e.subscribers.toLocaleString("en-US")}{" "}
                          subscribers
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-border-hairline px-1 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  onApply(null);
                }}
              >
                All experiments
              </Button>
              <Button
                size="sm"
                className="px-4"
                onClick={() => {
                  setOpen(false);
                  onApply(draft.length > 0 ? draft : null);
                }}
              >
                Apply
              </Button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function DatePicker({ range, onApply }: { range: DateRange; onApply: (range: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(range.from ?? "");
  const [to, setTo] = useState(range.to ?? "");
  const today = new Date().toISOString().slice(0, 10);

  function apply(next: DateRange) {
    setOpen(false);
    onApply(next);
  }

  const presetActive = (days: number) => range.from === isoDaysAgo(days) && range.to === null;
  const allTime = range.from === null && range.to === null;

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setFrom(range.from ?? "");
          setTo(range.to ?? "");
        }
        setOpen(next);
      }}
    >
      <Popover.Trigger
        aria-label={`Date filter: ${rangeLabel(range)}`}
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <TriggerButton icon={<CalendarRange className="size-4" />} label={rangeLabel(range)} active={!allTime} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start">
          <Popover.Popup className={popupClass}>
            <Popover.Title className="px-2 pb-2 pt-1.5 text-eyebrow text-text-tertiary">Date range (UTC)</Popover.Title>
            <div className="grid grid-cols-2 gap-1.5 px-1">
              <PresetButton active={allTime} onClick={() => apply({ from: null, to: null })}>
                All time
              </PresetButton>
              {PRESETS.map((p) => (
                <PresetButton
                  key={p.days}
                  active={presetActive(p.days)}
                  onClick={() => apply({ from: isoDaysAgo(p.days), to: null })}
                >
                  {p.label}
                </PresetButton>
              ))}
            </div>
            <div className="mt-3 border-t border-border-hairline px-1 pt-3">
              <p className="mb-2 px-1 text-[12px] font-medium text-text-secondary">Custom range</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-[11.5px] text-text-tertiary">
                  From
                  <Input type="date" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} className="h-9" />
                </label>
                <label className="flex flex-col gap-1 text-[11.5px] text-text-tertiary">
                  To
                  <Input type="date" value={to} min={from || undefined} max={today} onChange={(e) => setTo(e.target.value)} className="h-9" />
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  className="px-4"
                  disabled={!from && !to}
                  onClick={() => apply({ from: from || null, to: to || null })}
                >
                  Apply range
                </Button>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function PresetButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-3 py-2 text-left text-[13px] transition-colors",
        active ? "bg-accent-soft text-accent-bright" : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}
