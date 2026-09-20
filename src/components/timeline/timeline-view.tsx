import { useEffect, useMemo, useRef, useState } from "react";
import { layoutCards } from "@/lib/history/layout";
import { nearestEvent, selectColumnView } from "@/lib/history/query";
import { REGION_META } from "@/lib/history/regions";
import { useTimeline, useZoom } from "@/lib/history/store";
import type { HistoryEvent, Region } from "@/lib/history/types";
import {
  addYears,
  civilYearToOrdinal,
  formatYearBare,
  formatYearShort,
  spansYear,
  ticksAround,
} from "@/lib/history/years";
import { YEAR_MAX, YEAR_MIN } from "@/lib/history/catalog";
import { visualForEvent } from "@/lib/visuals/registry";
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
    let acc = 0;
    let raf = 0;
    const threshold = 56;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const pixels =
        e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * height : e.deltaY;
      acc += pixels;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (Math.abs(acc) < threshold) return;
        const dir = acc > 0 ? 1 : -1;
        acc = 0;
        shift(dir * zoom.step);
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [shift, zoom.step, height]);

  const pxPerYear = (height * 0.5) / zoom.halfWindow;
  const nowY = height * NOW;
  const visible = ORDER.filter((id) => regions[id]);
  const ticks = ticksAround(year, zoom.halfWindow, zoom.tick, YEAR_MIN, YEAR_MAX);
  const yearOrd = civilYearToOrdinal(year);

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
        className="now-band pointer-events-none absolute right-0 left-20 z-20"
        style={{ top: `${NOW * 100}%` }}
      >
        <div className="now-bloom" />
        <div className="now-dust" />
        <div className="now-rule" />
      </div>

      <div
        className="absolute top-0 bottom-0 left-0 z-30 flex w-20 flex-col border-r border-border bg-background/80"
        aria-hidden
      >
        <div className="relative h-full">
          {ticks.map((tick) => {
            const y = nowY + (civilYearToOrdinal(tick) - yearOrd) * pxPerYear;
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
                    "font-serif text-xs tabular-nums",
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
            yearOrd={yearOrd}
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
  yearOrd,
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
  yearOrd: number;
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
  const fallback = nearestEvent(region, year);
  const chip = view.now.headline;

  const placed = useMemo(() => {
    const band = 52;
    const items = view.events
      .filter((event) => event.startYear !== year)
      .filter((event) => !spansYear(event.startYear, event.endYear, year))
      .map((event) => {
        const placeYear = event.startYear;
        const naturalY =
          nowY + (civilYearToOrdinal(placeYear) - yearOrd) * pxPerYear;
        let targetY = naturalY;
        if (Math.abs(naturalY - nowY) < band) {
          targetY = naturalY >= nowY ? nowY + band : nowY - band;
        }
        return {
          id: event.id,
          event,
          placeYear,
          naturalY,
          targetY,
          significance: event.significance,
        };
      });
    return layoutCards(
      items.filter((item) => item.targetY > 72 && item.targetY < height - 28),
      64,
    );
  }, [view.events, nowY, yearOrd, pxPerYear, height, year]);

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

      <NowChip
        key={year}
        title={chip.title}
        label={chip.label}
        token={meta.token}
        nowY={nowY}
        eventId={chip.event?.id}
        active={chip.event?.id === selectedId}
        onClick={() => chip.event && onSelect(chip.event.id)}
      />

      {placed.map((item) => {
        const dist = Math.min(
          1,
          Math.abs(item.y - nowY) / Math.max(height * 0.42, 1),
        );
        const opacity = 1 - dist * 0.2;
        const scale = reduced ? 1 : 1 - dist * 0.03;
        return (
          <div
            key={item.event.id}
            className="absolute z-10"
            style={{
              top: item.y,
              left: item.lane === 0 ? "0.5rem" : "48%",
              right: item.lane === 0 ? "48%" : "0.5rem",
              transform: "translateY(-50%)",
              transition: reduced ? "none" : "top 250ms var(--ease-out)",
            }}
          >
            {Math.abs(item.y - item.naturalY) > 3 && (
              <span
                aria-hidden
                className="pointer-events-none absolute w-px bg-primary/35"
                style={{
                  left: "-0.35rem",
                  top: item.naturalY < item.y ? `calc(50% - ${item.y - item.naturalY}px)` : "50%",
                  height: Math.abs(item.y - item.naturalY),
                }}
              />
            )}
            <YearAnchor naturalY={item.naturalY} cardY={item.y} />
            <TimelineCard
              event={item.event}
              selected={item.event.id === selectedId}
              extra={item.cluster.length > 0 ? `  · +${item.cluster.length}` : ""}
              opacity={opacity}
              scale={scale}
              onSelect={onSelect}
            />
            {item.cluster.length > 0 && (
              <ClusterList
                events={item.cluster.map((row) => row.event)}
                onSelect={onSelect}
              />
            )}
          </div>
        );
      })}

      {placed.length === 0 && !chip.event && fallback && (
        <button
          type="button"
          onClick={() => {
            onJump(fallback.startYear);
            onSelect(fallback.id);
          }}
          className="absolute right-2 left-2 z-10 rounded-md border border-border bg-card/95 px-2.5 py-3 text-left"
          style={{ top: nowY + 28 }}
        >
          <p className="text-xs tracking-wide text-subtle">가까운 기록</p>
          <p className="mt-1 font-serif text-sm text-foreground">{fallback.title}</p>
        </button>
      )}
    </section>
  );
}

function TimelineCard({
  event,
  selected,
  extra,
  opacity,
  scale,
  onSelect,
}: {
  event: HistoryEvent;
  selected: boolean;
  extra: string;
  opacity: number;
  scale: number;
  onSelect: (id: string) => void;
}) {
  const visual = visualForEvent(event.id);
  return (
    <button
      type="button"
      onClick={() => onSelect(event.id)}
      className={cn(
        "timeline-card relative w-full min-h-12 overflow-hidden rounded-md border bg-card/95 px-2.5 py-2 text-left shadow-[var(--shadow-border)]",
        "hover:shadow-[var(--shadow-border-hover)]",
        selected ? "is-selected border-primary/35" : "border-border",
      )}
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {visual ? (
        <span aria-hidden className="card-preview">
          <img
            src={visual.src}
            alt=""
            className="archive-photo"
          />
        </span>
      ) : null}
      <p className="relative truncate font-serif text-xs leading-snug text-foreground md:text-sm">
        {event.title}
      </p>
      <p className="relative mt-0.5 truncate text-xs text-subtle">
        {event.approximate ? "약 " : ""}
        {event.startYear < 0
          ? `전${Math.abs(event.startYear)}`
          : event.startYear}
        {event.endYear != null &&
        event.endYear !== event.startYear
          ? `–${event.endYear < 0 ? Math.abs(event.endYear) : event.endYear}`
          : ""}
        {extra}
      </p>
    </button>
  );
}

function NowChip({
  title,
  label,
  token,
  nowY,
  eventId,
  active,
  onClick,
}: {
  title: string;
  label: string;
  token: string;
  nowY: number;
  eventId?: string;
  active: boolean;
  onClick: () => void;
}) {
  const visual = eventId ? visualForEvent(eventId) : undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "now-chip now-pass absolute right-2 left-2 z-20 flex min-h-10 items-center gap-2 rounded-md border px-2.5 py-1.5 text-left",
        "bg-background/90 shadow-[var(--shadow-border)]",
        active ? "border-primary/45" : "border-primary/25",
      )}
      style={{ top: nowY, transform: "translateY(-50%)" }}
    >
      {visual ? (
        <span aria-hidden className="now-chip-visual">
          <img src={visual.src} alt="" className="archive-photo" />
        </span>
      ) : null}
      <span className="relative size-1.5 shrink-0 rounded-full" style={{ background: token }} />
      <span className="relative min-w-0 flex-1">
        <span className="block truncate font-serif text-xs text-foreground md:text-sm">
          {title}
        </span>
        {label ? (
          <span className="block text-xs tracking-wide text-subtle">{label}</span>
        ) : null}
      </span>
    </button>
  );
}

function YearAnchor({ naturalY, cardY }: { naturalY: number; cardY: number }) {
  if (Math.abs(naturalY - cardY) < 3) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 -left-2 size-1 rounded-full bg-primary/70"
      title="실제 연도 위치"
    />
  );
}

function ClusterList({
  events,
  onSelect,
}: {
  events: HistoryEvent[];
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="mt-1 space-y-0.5">
      {events.map((event) => (
        <li key={event.id}>
          <button
            type="button"
            onClick={() => onSelect(event.id)}
            className="w-full truncate rounded px-1 py-1 text-left text-xs text-subtle hover:text-foreground"
          >
            {event.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
