import type { BreakdownItem } from "@/lib/dashboard/metrics";

export function BreakdownList({
  title,
  items,
  total,
}: {
  title: string;
  items: BreakdownItem[];
  total: number;
}) {
  return (
    <div>
      <p className="mb-3 text-eyebrow text-text-tertiary">{title}</p>
      {items.length === 0 ? (
        <p className="text-[13px] text-text-tertiary">No subscribers yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => {
            const share = total > 0 ? item.count / total : 0;
            return (
              <li key={item.label} className="relative overflow-hidden rounded-lg bg-bg-raised/60">
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-accent-soft"
                  style={{ width: `${share * 100}%` }}
                />
                <div className="relative flex items-center justify-between gap-3 px-3 py-2 text-[13px]">
                  <span className="truncate text-text-primary">{item.label}</span>
                  <span className="shrink-0 tabular-nums text-text-secondary">
                    {item.count.toLocaleString("en-US")}
                    <span className="ml-2 text-text-tertiary">{Math.round(share * 100)}%</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
