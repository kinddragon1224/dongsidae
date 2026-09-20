import { useEffect, useState } from "react";
import { REGION_META } from "@/lib/history/regions";
import { buildTimeSlice, type TimeSliceRegion } from "@/lib/history/slice";
import { useTimeline } from "@/lib/history/store";
import { REGIONS } from "@/lib/history/types";
import { eraTextureForYear, eraWashForYear } from "@/lib/visuals/era-context";
import { visualForEvent } from "@/lib/visuals/registry";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type Props = {
  layout: "desktop" | "mobile";
};

export function TimeSlice({ layout }: Props) {
  const year = useTimeline((s) => s.year);
  const select = useTimeline((s) => s.select);
  const reduced = usePrefersReducedMotion();
  const live = buildTimeSlice(year);
  const settledYear = useSettledYear(year, reduced ? 0 : 420);
  const settled = settledYear === year ? live : buildTimeSlice(settledYear);
  const dragging = settledYear !== year;
  const wash = eraWashForYear(settledYear);
  const texture = eraTextureForYear(year);

  useEffect(() => {
    const urls = new Set<string>();
    if (wash) urls.add(wash.src);
    for (const row of settled.regions) {
      const visual = row.eventId ? visualForEvent(row.eventId) : undefined;
      if (visual) urls.add(visual.src);
    }
    for (const src of urls) {
      const img = new Image();
      img.src = src;
    }
  }, [settled, wash]);

  return (
    <section
      className={cn(
        "time-slice relative min-w-0 overflow-hidden",
        layout === "desktop" && "hidden border-b border-border md:block",
        layout === "mobile" && "md:hidden",
        `era-wash-${texture}`,
      )}
      aria-label="이 시간의 세계"
    >
      {wash ? (
        <span aria-hidden className="slice-era-wash">
          <img
            src={wash.src}
            alt=""
            className="archive-photo h-full w-full object-cover"
            style={{
              objectPosition: wash.focalPoint
                ? `${wash.focalPoint.x * 100}% ${wash.focalPoint.y * 100}%`
                : "50% 40%",
            }}
          />
        </span>
      ) : null}

      <div className="relative px-4 pt-2.5 md:px-6">
        <div className="flex items-center gap-2">
          <SliceOrbit />
          <p className="text-xs tracking-[0.22em] text-subtle">이 시간의 세계</p>
        </div>
        <p
          key={live.sentence}
          className="year-swap mt-1.5 max-w-4xl font-serif text-sm leading-relaxed text-foreground"
        >
          {live.sentence}
        </p>
      </div>

      <div
        className={cn(
          "relative mt-2.5 min-w-0",
          dragging && !reduced && "opacity-50",
        )}
        style={{
          transition: reduced ? "none" : "opacity var(--motion-fast) var(--ease-out)",
        }}
      >
        <div className="slice-strip flex min-w-0">
          {settled.regions.map((row, index) => (
            <SliceCell
              key={row.region}
              row={row}
              index={index}
              onOpen={select}
            />
          ))}
        </div>
        <div aria-hidden className="slice-now-line" />
      </div>
    </section>
  );
}

function SliceCell({
  row,
  index,
  onOpen,
}: {
  row: TimeSliceRegion;
  index: number;
  onOpen: (id: string | null) => void;
}) {
  const meta = REGION_META[row.region];
  const visual = row.eventId ? visualForEvent(row.eventId) : undefined;
  const current = row.presence === "exact" || row.presence === "reign" || row.presence === "era";

  return (
    <button
      type="button"
      onClick={() => {
        if (row.eventId) onOpen(row.eventId);
      }}
      className="slice-cell relative min-h-16 min-w-0 flex-1 overflow-hidden text-left md:min-h-20"
      style={{
        marginLeft: index === 0 ? 0 : "-1rem",
        zIndex: REGIONS.length - index,
      }}
      aria-label={`${meta.label} ${row.title}`}
    >
      {visual ? (
        <img
          src={visual.src}
          alt=""
          className="archive-photo absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: visual.focalPoint
              ? `${visual.focalPoint.x * 100}% ${visual.focalPoint.y * 100}%`
              : "50% 38%",
          }}
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, color-mix(in oklab, ${meta.token} 32%, transparent), transparent 74%)`,
          }}
        />
      )}
      <span aria-hidden className="slice-cell-veil" />
      <span className="relative z-10 flex h-full min-w-0 flex-col justify-end px-2.5 py-1.5 md:px-3">
        <span className="flex items-center gap-1.5">
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ background: meta.token }}
          />
          <span className="truncate text-xs tracking-wide text-subtle">
            {meta.short}
            {row.label ? ` · ${row.label}` : ""}
          </span>
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate font-serif text-sm",
            current ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {row.title}
        </span>
      </span>
    </button>
  );
}

function SliceOrbit() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-3.5 text-primary/70"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      <circle cx="8" cy="2" r="0.7" fill="currentColor" />
      <circle cx="8" cy="14" r="0.55" fill="currentColor" />
      <circle cx="2.4" cy="8" r="0.55" fill="currentColor" />
      <circle cx="13.6" cy="8" r="0.55" fill="currentColor" />
    </svg>
  );
}

function useSettledYear(year: number, delay: number) {
  const [settled, setSettled] = useState(year);

  useEffect(() => {
    if (delay === 0) {
      setSettled(year);
      return;
    }
    const id = window.setTimeout(() => setSettled(year), delay);
    return () => window.clearTimeout(id);
  }, [year, delay]);

  return settled;
}
