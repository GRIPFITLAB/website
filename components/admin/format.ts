/** `/admin` URL carrying the experiment + date filters. */
export function adminHref(
  path: string,
  selected: string[] | null,
  range: { from: string | null; to: string | null },
): string {
  const q = new URLSearchParams();
  for (const id of selected ?? []) q.append("exp", id);
  if (range.from) q.set("from", range.from);
  if (range.to) q.set("to", range.to);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

/** 0.0423 → "4.23%". Fewer decimals once the number is large. */
export function formatPct(ratio: number): string {
  const pct = ratio * 100;
  const digits = pct === 0 ? 0 : pct < 10 ? 2 : 1;
  return `${pct.toFixed(digits)}%`;
}

export function formatDateTime(ms: number | null): string {
  if (ms === null) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(ms);
}

export function formatDay(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}
