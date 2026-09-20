import { yearSnapshot } from "@/lib/history/query";
import { REGION_META } from "@/lib/history/regions";
import { useTimeline } from "@/lib/history/store";

export function NowStrip() {
  const year = useTimeline((s) => s.year);
  const regions = useTimeline((s) => s.regions);
  const select = useTimeline((s) => s.select);
  const rows = yearSnapshot(year, 1).filter((row) => regions[row.region]);

  return (
    <div className="hidden border-b border-border md:block">
      <div className="grid grid-cols-4">
        {rows.map((row) => (
          <button
            key={row.region}
            type="button"
            onClick={() => row.event && select(row.event.id)}
            className="flex min-h-12 items-center gap-2 overflow-hidden border-r border-border px-3 py-2 text-left last:border-r-0 hover:bg-accent"
          >
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: REGION_META[row.region].token }}
            />
            <span className="min-w-0">
              <span className="block truncate text-[0.625rem] tracking-wide text-subtle">
                {REGION_META[row.region].short}
                {row.relative ? ` · ${row.relative}` : ""}
              </span>
              <span className="block truncate text-sm text-foreground">
                {row.title}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
