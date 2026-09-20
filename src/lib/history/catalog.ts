import { HISTORY_EVENTS } from "../../data/history-events.ts";
import { REGIONS, type HistoryEvent, type Region } from "./types.ts";
import { addYears } from "./years.ts";

const PAD = 30;

function extent(): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const event of HISTORY_EVENTS) {
    min = Math.min(min, event.startYear);
    max = Math.max(max, event.endYear ?? event.startYear);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: -221, max: 2020 };
  }
  return { min: addYears(min, -PAD), max: addYears(max, PAD) };
}

const RANGE = extent();

/** Inclusive civil-year range of the timeline, derived from seed data + padding. */
export const YEAR_MIN = RANGE.min;
export const YEAR_MAX = RANGE.max;

export const EVENTS_BY_ID = new Map(
  HISTORY_EVENTS.map((event) => [event.id, event] as const),
);

export const EVENTS_BY_REGION: Record<Region, HistoryEvent[]> = {
  christianity: [],
  korea: [],
  east_asia: [],
  world: [],
};

export const ERAS_BY_REGION: Record<Region, HistoryEvent[]> = {
  christianity: [],
  korea: [],
  east_asia: [],
  world: [],
};

for (const event of HISTORY_EVENTS) {
  EVENTS_BY_REGION[event.region].push(event);
  if (event.kind === "era") ERAS_BY_REGION[event.region].push(event);
}

export function getEventById(id: string): HistoryEvent | undefined {
  return EVENTS_BY_ID.get(id);
}

export function eventsForRegion(region: Region): HistoryEvent[] {
  return EVENTS_BY_REGION[region];
}

export function allRegions(): readonly Region[] {
  return REGIONS;
}

export { HISTORY_EVENTS };
