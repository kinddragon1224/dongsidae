import { useRef } from "react";
import { ERA_SHORTCUTS } from "@/lib/history/constants";
import { getRegionSnapshot } from "@/lib/history/snapshot";
import { REGION_META } from "@/lib/history/regions";
import { useTimeline, useZoom } from "@/lib/history/store";
import type { Region } from "@/lib/history/types";
import { REGIONS } from "@/lib/history/types";
import { formatYearBare } from "@/lib/history/years";
import { jumpThroughTime } from "@/lib/visuals/jump";
import { cn } from "@/lib/utils";
import { EventCard } from "./event-card";
import { TimeSlice } from "./time-slice";

/** Sparse decades still show the nearest sourced event in each column. */
const MOBILE_NEARBY = 80;

export function MobileNow() {
  const year = useTimeline((s) => s.year);
  const selectedId = useTimeline((s) => s.selectedId);
  const select = useTimeline((s) => s.select);
  const shift = useTimeline((s) => s.shift);
  const setYearInputOpen = useTimeline((s) => s.setYearInputOpen);
  const zoom = useZoom();
  const swipe = useSwipeYear(
    () => shift(-zoom.step),
    () => shift(zoom.step),
  );

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden">
      <div className="shrink-0 border-b border-border">
        <button
          type="button"
          onClick={() => {
            if (swipe.didSwipe.current) return;
            setYearInputOpen(true);
          }}
          onPointerDown={swipe.onPointerDown}
          onPointerMove={swipe.onPointerMove}
          onPointerUp={swipe.onPointerUp}
          onPointerCancel={swipe.onPointerUp}
          className="relative flex w-full min-w-0 min-h-14 touch-manipulation flex-col items-start justify-center overflow-hidden px-4 pt-2.5 pb-1 text-left"
          aria-label="연도 입력. 좌우로 밀면 연도가 바뀝니다."
        >
          <span className="relative text-xs tracking-[0.22em] text-subtle">지금</span>
          <span
            key={year}
            className="year-swap relative mt-1 block max-w-full font-serif text-4xl leading-none font-medium tracking-tight text-primary tabular-nums"
          >
            {formatYearBare(year)}
          </span>
        </button>
        <TimeSlice layout="mobile" />
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pt-3 pb-4">
        {REGIONS.map((id) => (
          <RegionNowList
            key={id}
            region={id}
            year={year}
            selectedId={selectedId}
            onSelect={select}
          />
        ))}

        <div className="mt-1 flex min-w-0 gap-1.5 overflow-x-auto pb-1">
          {ERA_SHORTCUTS.map((era) => (
            <button
              key={era.id}
              type="button"
              onClick={() => jumpThroughTime(era.year)}
              className={cn(
                "h-11 shrink-0 rounded-full px-3.5 text-sm",
                year === era.year
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground",
              )}
            >
              {era.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RegionNowList({
  region,
  year,
  selectedId,
  onSelect,
}: {
  region: Region;
  year: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const snap = getRegionSnapshot(region, year, {
    nearbyRange: MOBILE_NEARBY,
    nearbyLimit: 2,
  });
  const meta = REGION_META[region];
  const nowEvents = uniqueActive(snap.active).slice(0, 2);
  const nearby = [...snap.nearbyBefore, ...snap.nearbyAfter]
    .sort((a, b) => a.years - b.years)
    .filter((item) => !nowEvents.some((row) => row.event.id === item.event.id))
    .slice(0, 2);

  if (nowEvents.length === 0 && nearby.length === 0) return null;

  return (
    <section className="mb-5">
      <div className="mb-2 flex items-baseline gap-2">
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: meta.token }}
        />
        <h2 className="font-serif text-sm text-foreground">{meta.label}</h2>
      </div>
      <div className="flex flex-col gap-2">
        {nowEvents.map((item) => (
          <EventCard
            key={item.event.id}
            event={item.event}
            active={item.event.id === selectedId}
            compact
            onSelect={onSelect}
            currentYear={year}
            label={item.label}
          />
        ))}
        {nearby.map((item) => (
          <EventCard
            key={item.event.id}
            event={item.event}
            active={item.event.id === selectedId}
            compact
            onSelect={onSelect}
            currentYear={year}
            label={item.label}
          />
        ))}
      </div>
    </section>
  );
}

function uniqueActive<T extends { event: { id: string; kind: string } }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (item.event.kind === "era") return false;
    if (seen.has(item.event.id)) return false;
    seen.add(item.event.id);
    return true;
  });
}

function useSwipeYear(onBack: () => void, onForward: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);
  const ratio = 1.2;

  return {
    didSwipe,
    onPointerDown: (e: React.PointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY };
      didSwipe.current = false;
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy) * ratio) {
        didSwipe.current = true;
      }
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * ratio) {
        didSwipe.current = true;
        if (dx < 0) onForward();
        else onBack();
      }
    },
  };
}
