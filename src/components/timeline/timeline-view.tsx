import { useEffect, useRef, useState } from "react";
import { nearestEvent, selectColumnView } from "@/lib/history/query";
import { REGION_META } from "@/lib/history/regions";
import { useTimeline, useZoom } from "@/lib/history/store";
import type { Region } from "@/lib/history/types";
import {
  addYears,
  distanceToYear,
  formatDistance,
  formatYearBare,
  formatYearShort,
  spansYear,
  ticksAround,
} from "@/lib/history/years";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

const ORDER: Region[] = ["christianity", "korea", "east_asia", "world"];
const NOW = 0.42;

export function TimelineView() {
  const year = useTimeline((s) => s.year);
  const shift = useTimeline((s) => s.shift);
  const setYear = useTimeline((s) => s.setYear);
  const regions = useTimeline((s) => s.regions);
  const selectedId = useTimeline((s) => s.selectedId);
  const select = useTimeline((s) => s.select);
  const zoom = useZoom();
  const reduced = usePrefersReducedMotion();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; year: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [height, setHeight] = useState(640);

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const measure = () => setHeight(el.clientHeight || 640);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      shift(dir * zoom.step);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [shift, zoom.step]);

  const pxPerYear = (height * 0.5) / zoom.halfWindow;
  const nowY = height * NOW;
  const visible = ORDER.filter((id) => regions[id]);
  const ticks = ticksAround(year, zoom.halfWindow, zoom.tick);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    drag.current = { y: e.clientY, year };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const dy = e.clientY - drag.current.y;
    const deltaYears = -Math.round(dy / pxPerYear);
    if (deltaYears !== 0) {
      setYear(addYears(drag.current.year, deltaYears));
    }
  }

  function onPointerUp() {
    drag.current = null;
    setDragging(false);
  }

  return (
    <div
      ref={surfaceRef}
      className="relative min-h-0 flex-1 cursor-ns-resize overflow-hidden select-none"
      style={{ touchAction: dragging ? "none" : "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        aria-hidden
        className="now-rule pointer-events-none absolute right-0 left-20 z-20 h-px"
        style={{ top: `${NOW * 100}%` }}
      />

      <div
        className="absolute top-0 bottom-0 left-0 z-30 flex w-20 flex-col border-r border-border bg-background/80"
        aria-hidden
      >
        <div className="relative h-full">
          {ticks.map((tick) => {
            const y = nowY + (tick - year) * pxPerYear;
            if (y < 8 || y > height - 8) return null;
            const major = tick % (zoom.tick * 5) === 0;
            return (
              <div
                key={tick}
                className="absolute right-0 flex items-center gap-1"
                style={{
                  top: y,
                  transform: "translateY(-50%)",
                  transition: reduced ? "none" : "top 250ms var(--ease-out)",
                }}
              >
                <span
                  className={cn(
                    "font-serif text-[0.625rem] tabular-nums",
                    major ? "text-muted-foreground" : "text-subtle",
                  )}
                >
                  {formatYearShort(tick)}
                </span>
                <span
                  className={cn(
                    "h-px bg-border",
                    major ? "w-3" : "w-2 opacity-60",
                  )}
                />
              </div>
            );
          })}
          <div
            className="absolute right-0 left-0 flex items-center justify-end pr-2"
            style={{ top: nowY, transform: "translateY(-50%)" }}
          >
            <span
              key={year}
              className="year-swap font-serif text-xl font-medium tracking-tight text-primary tabular-nums"
            >
              {formatYearBare(year)}
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-y-0 right-0 left-20 grid"
        style={{
          gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))`,
        }}
      >
        {visible.map((id) => (
          <RegionColumn
            key={id}
            region={id}
            year={year}
            nowY={nowY}
            pxPerYear={pxPerYear}
            height={height}
            reduced={reduced}
            selectedId={selectedId}
            onSelect={select}
            onJump={setYear}
          />
        ))}
      </div>
    </div>
  );
}

function RegionColumn({
  region,
  year,
  nowY,
  pxPerYear,
  height,
  reduced,
  selectedId,
  onSelect,
  onJump,
}: {
  region: Region;
  year: number;
  nowY: number;
  pxPerYear: number;
  height: number;
  reduced: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onJump: (year: number) => void;
}) {
  const zoom = useZoom();
  const view = selectColumnView(region, year, zoom);
  const meta = REGION_META[region];
  const minGap = 62;
  const fallback = nearestEvent(region, year);

  const placed = view.events
    .map((event) => {
      const placeYear =
        event.kind === "era" &&
        event.endYear != null &&
        spansYear(event.startYear, event.endYear, year)
          ? year
          : event.startYear;
      return {
        event,
        placeYear,
        y: nowY + (placeYear - year) * pxPerYear,
      };
    })
    .filter((item) => item.y > 64 && item.y < height - 32)
    .sort((a, b) => {
      if (a.placeYear !== b.placeYear) return a.placeYear - b.placeYear;
      const aEra = a.event.kind === "era" ? 1 : 0;
      const bEra = b.event.kind === "era" ? 1 : 0;
      if (aEra !== bEra) return aEra - bEra;
      return b.event.significance - a.event.significance;
    });

  for (let i = 1; i < placed.length; i += 1) {
    const prev = placed[i - 1]!;
    const curr = placed[i]!;
    if (curr.y < prev.y + minGap) {
      curr.y = prev.y + minGap;
    }
  }

  return (
    <section className="relative border-r border-border last:border-r-0">
      <header className="absolute top-0 right-0 left-0 z-10 bg-gradient-to-b from-background via-background/90 to-transparent px-3 pt-3 pb-8">
        <div className="flex items-center gap-2">
          <span
            className="size-1.5 rounded-full"
            style={{ background: meta.token }}
          />
          <h2 className="font-serif text-sm text-foreground">{meta.label}</h2>
        </div>
        {view.eras.length > 0 && (
          <p className="mt-1 truncate text-xs text-subtle">
            {view.eras.map((era) => era.title).join(" · ")}
          </p>
        )}
      </header>

      {placed.map((item) => (
        <div
          key={item.event.id}
          className="absolute right-2 left-2 z-10"
          style={{
            top: item.y,
            transform: "translateY(-50%)",
            transition: reduced ? "none" : "top 250ms var(--ease-out)",
          }}
        >
          <button
            type="button"
            onClick={() => onSelect(item.event.id)}
            className={cn(
              "w-full min-h-12 rounded-md border bg-card/95 px-2.5 py-2.5 text-left shadow-[var(--shadow-border)]",
              "hover:shadow-[var(--shadow-border-hover)]",
              item.event.id === selectedId || item.placeYear === year
                ? "border-primary/35"
                : "border-border",
            )}
          >
            <p className="truncate font-serif text-xs leading-snug text-foreground md:text-sm">
              {item.event.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-subtle">
              {item.event.approximate ? "약 " : ""}
              {item.event.startYear < 0
                ? `전${Math.abs(item.event.startYear)}`
                : item.event.startYear}
              {item.event.endYear != null &&
              item.event.endYear !== item.event.startYear
                ? `–${item.event.endYear < 0 ? Math.abs(item.event.endYear) : item.event.endYear}`
                : ""}
            </p>
          </button>
        </div>
      ))}

      {placed.length === 0 && fallback && (
        <button
          type="button"
          onClick={() => {
            onJump(fallback.startYear);
            onSelect(fallback.id);
          }}
          className="absolute right-2 left-2 z-10 rounded-md border border-border bg-card/95 px-2.5 py-3 text-left"
          style={{ top: nowY + 18 }}
        >
          <p className="text-[0.625rem] tracking-wide text-subtle">가까운 기록</p>
          <p className="mt-1 font-serif text-sm text-foreground">{fallback.title}</p>
          <p className="mt-0.5 font-serif text-xs tabular-nums text-muted-foreground">
            {distanceToYear(fallback.startYear, fallback.endYear, year) === 0
              ? "이 해"
              : formatDistance(year, fallback.startYear)}
          </p>
        </button>
      )}
    </section>
  );
}
