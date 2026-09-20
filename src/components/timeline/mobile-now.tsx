import { useRef } from "react";
import { ERA_SHORTCUTS, ZOOM_LEVELS } from "@/lib/history/constants";
import { yearHeadline } from "@/lib/history/query";
import { getRegionSnapshot } from "@/lib/history/snapshot";
import { REGION_META } from "@/lib/history/regions";
import { useTimeline, useZoom } from "@/lib/history/store";
import type { Region } from "@/lib/history/types";
import { REGIONS } from "@/lib/history/types";
import { formatYearBare } from "@/lib/history/years";
import { cn } from "@/lib/utils";
import { EventCard } from "./event-card";

export function MobileNow() {
  const year = useTimeline((s) => s.year);
  const selectedId = useTimeline((s) => s.selectedId);
  const select = useTimeline((s) => s.select);
  const regions = useTimeline((s) => s.regions);
  const toggleRegion = useTimeline((s) => s.toggleRegion);
  const setYear = useTimeline((s) => s.setYear);
  const shift = useTimeline((s) => s.shift);
  const zoomId = useTimeline((s) => s.zoomId);
  const setZoom = useTimeline((s) => s.setZoom);
  const setYearInputOpen = useTimeline((s) => s.setYearInputOpen);
  const zoom = useZoom();
  const swipe = useSwipeYear(
    () => shift(-zoom.step),
    () => shift(zoom.step),
  );
  const sectionRefs = useRef<Partial<Record<Region, HTMLElement | null>>>({});
  const headline = yearHeadline(year);
  const visible = REGIONS.filter((id) => regions[id]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border px-3 pt-3 pb-3">
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
          className="flex min-h-[4.5rem] w-full touch-manipulation flex-col items-center justify-center px-1 text-center"
          aria-label="연도 입력. 좌우로 밀면 연도가 바뀝니다."
        >
          <span
            key={year}
            className="year-swap block font-serif text-5xl leading-none font-medium tracking-tight text-primary tabular-nums"
          >
            {formatYearBare(year)}
          </span>
          <span className="mt-2 block truncate text-sm text-muted-foreground">
            {headline}
          </span>
        </button>

        <div className="mt-4 grid grid-cols-2 gap-1.5">
          {visible.map((id) => {
            const row = getRegionSnapshot(id, year, { nearbyRange: 12, nearbyLimit: 1 });
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  sectionRefs.current[id]?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="flex min-h-14 items-start gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-left active:bg-accent"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full"
                  style={{ background: REGION_META[id].token }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.625rem] tracking-wide text-subtle">
                    {REGION_META[id].short}
                    {row.headline.label ? ` · ${row.headline.label}` : ""}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-foreground">
                    {row.headline.title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5">
          {REGIONS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleRegion(id)}
              className={cn(
                "h-11 shrink-0 rounded-full px-3 text-sm",
                regions[id]
                  ? "bg-secondary text-foreground"
                  : "text-subtle line-through",
              )}
            >
              {REGION_META[id].short}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-1 overflow-x-auto pb-0.5">
          {ZOOM_LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setZoom(level.id)}
              className={cn(
                "h-11 shrink-0 rounded-full px-4 text-sm",
                zoomId === level.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-4 pb-5">
        {visible.map((id) => {
          const snap = getRegionSnapshot(id, year, { nearbyRange: 16, nearbyLimit: 4 });
          const meta = REGION_META[id];
          const activeEvents = snap.active.filter(
            (item, index, arr) =>
              arr.findIndex((row) => row.event.id === item.event.id) === index,
          );
          return (
            <section
              key={id}
              ref={(el) => {
                sectionRefs.current[id] = el;
              }}
              className="mb-7 scroll-mt-3"
            >
              <div className="mb-2.5 flex items-baseline gap-2 px-0.5">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: meta.token }}
                />
                <h2 className="font-serif text-base text-foreground">{meta.label}</h2>
              </div>

              {activeEvents.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 px-0.5 text-[0.625rem] tracking-wide text-subtle">
                    지금
                  </p>
                  <div className="flex flex-col gap-2">
                    {activeEvents.map((item) => (
                      <EventCard
                        key={item.event.id}
                        event={item.event}
                        active={item.event.id === selectedId}
                        onSelect={select}
                        currentYear={year}
                        label={item.label}
                      />
                    ))}
                  </div>
                </div>
              )}

              {(snap.nearbyBefore.length > 0 || snap.nearbyAfter.length > 0) && (
                <div>
                  <p className="mb-1.5 px-0.5 text-[0.625rem] tracking-wide text-subtle">
                    전후
                  </p>
                  <div className="flex flex-col gap-2">
                    {[...snap.nearbyBefore, ...snap.nearbyAfter]
                      .sort((a, b) => a.years - b.years)
                      .map((item) => (
                        <EventCard
                          key={item.event.id}
                          event={item.event}
                          active={item.event.id === selectedId}
                          onSelect={select}
                          currentYear={year}
                          label={item.label}
                        />
                      ))}
                  </div>
                </div>
              )}

              {activeEvents.length === 0 &&
                snap.nearbyBefore.length === 0 &&
                snap.nearbyAfter.length === 0 && (
                  <p className="px-0.5 text-sm text-subtle">가까운 기록이 드뭅니다.</p>
                )}
            </section>
          );
        })}

        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {ERA_SHORTCUTS.map((era) => (
            <button
              key={era.id}
              type="button"
              onClick={() => setYear(era.year)}
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
