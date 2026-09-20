import { HISTORY_EVENTS } from "@/data/history-events";
import type { HistoryEvent, Region, ZoomLevel } from "./types";
import { REGIONS } from "./types";
import { distanceToYear, formatDistance, spansYear, yearsBetween } from "./years";

const BY_ID = new Map(HISTORY_EVENTS.map((event) => [event.id, event]));

const SEARCH_INDEX = HISTORY_EVENTS.map((event) => ({
  event,
  haystack: [
    event.title,
    event.summary,
    event.description ?? "",
    event.meaning ?? "",
    event.yearNote ?? "",
    event.people?.join(" ") ?? "",
    event.tags?.join(" ") ?? "",
    event.categories.join(" "),
    String(event.startYear),
    event.endYear != null ? String(event.endYear) : "",
  ]
    .join(" ")
    .toLowerCase(),
}));

export function getEventById(id: string): HistoryEvent | undefined {
  return BY_ID.get(id);
}

export function eventsForRegion(region: Region): HistoryEvent[] {
  return HISTORY_EVENTS.filter((event) => event.region === region);
}

export function activeEras(year: number, region: Region): HistoryEvent[] {
  return HISTORY_EVENTS.filter(
    (event) =>
      event.region === region &&
      event.kind === "era" &&
      spansYear(event.startYear, event.endYear, year),
  ).sort((a, b) => spanLength(a) - spanLength(b));
}

function spanLength(event: HistoryEvent): number {
  return yearsBetween(event.startYear, event.endYear ?? event.startYear);
}

export function selectColumnView(
  region: Region,
  year: number,
  zoom: ZoomLevel,
): { eras: HistoryEvent[]; events: HistoryEvent[] } {
  const eras = activeEras(year, region).slice(0, 2);
  const reigns = eras.filter((event) => spanLength(event) <= 90);

  const candidates = HISTORY_EVENTS.filter((event) => {
    if (event.region !== region) return false;
    if (event.kind === "era") return false;
    return distanceToYear(event.startYear, event.endYear, year) <= zoom.halfWindow;
  });

  candidates.sort((a, b) => scoreEvent(a, year) - scoreEvent(b, year));

  const picked: HistoryEvent[] = [...reigns];
  const usedYears = new Map<number, number>();
  const reignStarts = new Set(reigns.map((event) => event.startYear));

  for (const event of candidates) {
    if (picked.length >= zoom.maxCards) break;
    if (reignStarts.has(event.startYear) && event.significance < 5) continue;
    const bucket = Math.round(event.startYear / zoom.tick) * zoom.tick;
    const count = usedYears.get(bucket) ?? 0;
    const isExact = distanceToYear(event.startYear, event.endYear, year) === 0;
    if (count >= 2 && !isExact && event.significance < 4) continue;
    usedYears.set(bucket, count + 1);
    picked.push(event);
  }

  picked.sort((a, b) => a.startYear - b.startYear);
  return { eras, events: picked };
}

function scoreEvent(event: HistoryEvent, year: number): number {
  const dist = distanceToYear(event.startYear, event.endYear, year);
  const kindBoost = event.kind === "era" ? 8 : 0;
  return dist * 4 - event.significance * 12 + kindBoost;
}

export function contemporaneous(
  year: number,
  range: number,
  excludeId?: string,
): HistoryEvent[] {
  return HISTORY_EVENTS.filter((event) => {
    if (event.id === excludeId) return false;
    if (event.kind === "era") return false;
    return distanceToYear(event.startYear, event.endYear, year) <= range;
  }).sort((a, b) => {
    const da = distanceToYear(a.startYear, a.endYear, year);
    const db = distanceToYear(b.startYear, b.endYear, year);
    if (da !== db) return da - db;
    return b.significance - a.significance;
  });
}

export function searchEvents(query: string, limit = 24): HistoryEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const asYear = Number(q.replace(/[^\d-]/g, ""));
  const yearQuery = Number.isFinite(asYear) && q.match(/-?\d{2,4}/);

  const scored = SEARCH_INDEX.map(({ event, haystack }) => {
    let score = 0;
    if (event.title.toLowerCase() === q) score += 100;
    else if (event.title.toLowerCase().includes(q)) score += 60;
    if (event.people?.some((p) => p.toLowerCase().includes(q))) score += 40;
    if (event.tags?.some((t) => t.toLowerCase().includes(q))) score += 30;
    if (haystack.includes(q)) score += 12;
    if (yearQuery && (event.startYear === asYear || event.endYear === asYear)) {
      score += 50;
    }
    return { event, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.event.startYear - b.event.startYear);

  return scored.slice(0, limit).map((row) => row.event);
}

export function relatedEvents(event: HistoryEvent): HistoryEvent[] {
  const linked = (event.relatedEventIds ?? [])
    .map((id) => BY_ID.get(id))
    .filter((item): item is HistoryEvent => Boolean(item));

  if (linked.length >= 3) return linked.slice(0, 4);

  const extras = HISTORY_EVENTS.filter((other) => {
    if (other.id === event.id) return false;
    if (linked.some((l) => l.id === other.id)) return false;
    if (other.kind === "era") return false;
    return other.significance >= 4;
  })
    .sort(
      (a, b) =>
        yearsBetween(event.startYear, a.startYear) -
        yearsBetween(event.startYear, b.startYear),
    )
    .slice(0, 3 - linked.length);

  return [...linked, ...extras];
}

export function eventsAround(
  year: number,
  offset: number,
  region?: Region,
): HistoryEvent[] {
  const target = year + offset + (year < 0 && year + offset >= 0 ? 1 : 0);
  return HISTORY_EVENTS.filter((event) => {
    if (region && event.region !== region) return false;
    if (event.kind === "era") return false;
    return distanceToYear(event.startYear, event.endYear, target) <= 8;
  })
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 6);
}

function byDistance(year: number) {
  return (a: HistoryEvent, b: HistoryEvent) => {
    const da = distanceToYear(a.startYear, a.endYear, year);
    const db = distanceToYear(b.startYear, b.endYear, year);
    if (da !== db) return da - db;
    const sa = yearsBetween(a.startYear, a.endYear ?? a.startYear);
    const sb = yearsBetween(b.startYear, b.endYear ?? b.startYear);
    if (sa !== sb) return sa - sb;
    if (a.significance !== b.significance) return b.significance - a.significance;
    return Math.abs(a.startYear - year) - Math.abs(b.startYear - year);
  };
}

/** Closest non-era events for a region, even far outside the zoom window. */
export function nearbyEvents(
  region: Region,
  year: number,
  limit = 8,
): HistoryEvent[] {
  return HISTORY_EVENTS.filter(
    (event) => event.region === region && event.kind !== "era",
  )
    .sort(byDistance(year))
    .slice(0, limit);
}

export function nearestEvent(
  region: Region,
  year: number,
): HistoryEvent | undefined {
  return nearbyEvents(region, year, 1)[0];
}

export type RegionNow = {
  region: Region;
  era: HistoryEvent | undefined;
  event: HistoryEvent | undefined;
  nearby: HistoryEvent[];
  title: string;
  relative: string;
};

export function regionNow(region: Region, year: number, limit = 8): RegionNow {
  const era = activeEras(year, region)[0];
  const nearby = nearbyEvents(region, year, limit);
  const event = nearby[0];
  const dist = event
    ? distanceToYear(event.startYear, event.endYear, year)
    : null;
  const relative =
    dist == null ? "" : dist === 0 ? "이 해" : formatDistance(year, event!.startYear);
  const title = event?.title ?? era?.title ?? "가까운 기록이 드뭅니다";
  return { region, era, event, nearby, title, relative };
}

export function yearSnapshot(year: number, limit = 8): RegionNow[] {
  return REGIONS.map((region) => regionNow(region, year, limit));
}

export function yearHeadline(year: number): string {
  const rows = yearSnapshot(year, 1);
  const exact = rows.find((row) => row.relative === "이 해" && row.event);
  if (exact?.event) return exact.event.title;
  const strongest = [...rows]
    .filter((row) => row.event)
    .sort((a, b) => (b.event?.significance ?? 0) - (a.event?.significance ?? 0))[0];
  if (strongest?.era) return strongest.era.title;
  if (strongest?.event) return strongest.event.title;
  return "같은 시간, 다른 세계";
}

export { HISTORY_EVENTS };
