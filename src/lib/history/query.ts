import {
  EVENTS_BY_ID,
  EVENTS_BY_REGION,
  HISTORY_EVENTS,
  getEventById,
} from "./catalog.ts";
import {
  eventTimeLabel,
  getRegionSnapshot,
  getYearSnapshot,
  relatedEvents,
  yearHeadline,
  type YearRegionSnapshot,
} from "./snapshot.ts";
import { REGIONS, type HistoryEvent, type Region, type ZoomLevel } from "./types.ts";
import {
  addYears,
  distanceToYear,
  formatDistance,
  parseYearInput,
  spansYear,
  yearsBetween,
} from "./years.ts";

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

export { getEventById, HISTORY_EVENTS, relatedEvents, yearHeadline };
export { getYearSnapshot, getRegionSnapshot, eventTimeLabel };

export function eventsForRegion(region: Region): HistoryEvent[] {
  return EVENTS_BY_REGION[region];
}

export function activeEras(year: number, region: Region): HistoryEvent[] {
  return getRegionSnapshot(region, year, { nearbyRange: 0, nearbyLimit: 0 })
    .activeEras;
}

export function selectColumnView(
  region: Region,
  year: number,
  zoom: ZoomLevel,
): { eras: HistoryEvent[]; events: HistoryEvent[]; now: YearRegionSnapshot } {
  const now = getRegionSnapshot(region, year, {
    nearbyRange: zoom.halfWindow,
    nearbyLimit: zoom.maxCards,
  });
  const eras = now.activeEras.slice(0, 2);
  const headlineId = now.headline.event?.id;

  const windowed = EVENTS_BY_REGION[region].filter((event) => {
    if (event.kind === "era") return false;
    return distanceToYear(event.startYear, event.endYear, year) <= zoom.halfWindow;
  });

  windowed.sort((a, b) => scoreEvent(a, year) - scoreEvent(b, year));

  const picked: HistoryEvent[] = [];
  const usedYears = new Map<number, number>();

  for (const event of windowed) {
    if (picked.length >= zoom.maxCards) break;
    if (event.id === headlineId) {
      picked.push(event);
      continue;
    }
    const bucket = Math.round(event.startYear / zoom.tick) * zoom.tick;
    const count = usedYears.get(bucket) ?? 0;
    const isExact = distanceToYear(event.startYear, event.endYear, year) === 0;
    if (count >= 2 && !isExact && event.significance < 4) continue;
    usedYears.set(bucket, count + 1);
    picked.push(event);
  }

  if (
    headlineId &&
    now.headline.event &&
    now.headline.event.kind !== "era" &&
    !picked.some((event) => event.id === headlineId)
  ) {
    picked.unshift(now.headline.event);
  }

  picked.sort((a, b) => a.startYear - b.startYear);
  return { eras, events: picked, now };
}

function scoreEvent(event: HistoryEvent, year: number): number {
  const dist = distanceToYear(event.startYear, event.endYear, year);
  return dist * 4 - event.significance * 12;
}

export function contemporaneous(
  year: number,
  range: number,
  excludeId?: string,
): HistoryEvent[] {
  const snap = getYearSnapshot(year, { nearbyRange: range, nearbyLimit: 8 });
  const out: HistoryEvent[] = [];
  const seen = new Set<string>();
  if (excludeId) seen.add(excludeId);

  function add(event: HistoryEvent) {
    if (seen.has(event.id)) return;
    seen.add(event.id);
    out.push(event);
  }

  for (const row of snap.regions) {
    for (const item of row.active) add(item.event);
  }
  for (const row of snap.regions) {
    for (const item of [...row.nearbyBefore, ...row.nearbyAfter]) add(item.event);
  }
  return out;
}

export function searchEvents(query: string, limit = 24): HistoryEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const parsedYear = parseYearInput(query);
  const yearQuery = parsedYear != null;

  const scored = SEARCH_INDEX.map(({ event, haystack }) => {
    let score = 0;
    if (event.title.toLowerCase() === q) score += 100;
    else if (event.title.toLowerCase().includes(q)) score += 60;
    if (event.people?.some((p) => p.toLowerCase().includes(q))) score += 40;
    if (event.tags?.some((t) => t.toLowerCase().includes(q))) score += 30;
    if (haystack.includes(q)) score += 12;
    if (yearQuery && parsedYear != null) {
      if (event.startYear === parsedYear || event.endYear === parsedYear) {
        score += 80;
      } else if (spansYear(event.startYear, event.endYear, parsedYear)) {
        score += 40;
      }
    }
    return { event, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.event.startYear - b.event.startYear);

  return scored.slice(0, limit).map((row) => row.event);
}

export function eventsAround(
  year: number,
  offset: number,
  region?: Region,
): HistoryEvent[] {
  const target = addYears(year, offset);
  const rows = region
    ? [getRegionSnapshot(region, target, { nearbyRange: 8, nearbyLimit: 6 })]
    : getYearSnapshot(target, { nearbyRange: 8, nearbyLimit: 3 }).regions;

  const out: HistoryEvent[] = [];
  for (const row of rows) {
    for (const item of row.active) {
      if (item.event.kind === "era") continue;
      out.push(item.event);
    }
    for (const item of [...row.nearbyBefore, ...row.nearbyAfter]) {
      out.push(item.event);
    }
  }
  return out
    .filter((event, index, arr) => arr.findIndex((row) => row.id === event.id) === index)
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

export function nearbyEvents(
  region: Region,
  year: number,
  limit = 8,
): HistoryEvent[] {
  return EVENTS_BY_REGION[region]
    .filter((event) => event.kind !== "era")
    .sort(byDistance(year))
    .slice(0, limit);
}

export function nearestEvent(
  region: Region,
  year: number,
): HistoryEvent | undefined {
  const snap = getRegionSnapshot(region, year, { nearbyRange: 80, nearbyLimit: 1 });
  return snap.headline.event ?? nearbyEvents(region, year, 1)[0];
}

export type RegionNow = {
  region: Region;
  era: HistoryEvent | undefined;
  event: HistoryEvent | undefined;
  nearby: HistoryEvent[];
  title: string;
  relative: string;
  snapshot: YearRegionSnapshot;
};

export function regionNow(region: Region, year: number, limit = 8): RegionNow {
  const snapshot = getRegionSnapshot(region, year, {
    nearbyRange: Math.max(12, limit * 2),
    nearbyLimit: limit,
  });
  const era = snapshot.activeEras[0];
  const event = snapshot.headline.event;
  const nearby = [
    ...snapshot.exactEvents,
    ...snapshot.ongoingEvents.filter((item) => item.kind !== "era"),
    ...snapshot.nearbyBefore.map((item) => item.event),
    ...snapshot.nearbyAfter.map((item) => item.event),
  ]
    .filter((item, index, arr) => arr.findIndex((row) => row.id === item.id) === index)
    .slice(0, limit);

  return {
    region,
    era,
    event,
    nearby,
    title: snapshot.headline.title,
    relative: snapshot.headline.label,
    snapshot,
  };
}

export function yearSnapshot(year: number, limit = 8): RegionNow[] {
  return REGIONS.map((region) => regionNow(region, year, limit));
}

export { EVENTS_BY_ID, formatDistance, spansYear };
