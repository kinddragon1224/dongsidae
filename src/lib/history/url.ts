import { ZOOM_LEVELS } from "./constants.ts";
import { REGIONS, type Region, type ZoomId } from "./types.ts";
import { clampYear, parseYearInput } from "./years.ts";
import { YEAR_MAX, YEAR_MIN } from "./catalog.ts";
import { getEventById } from "./catalog.ts";

export type TimelineUrlState = {
  year: number;
  zoomId: ZoomId;
  regions: Region[];
  eventId: string | null;
};

const DEFAULT_ZOOM: ZoomId = "decade";

export function defaultRegions(): Region[] {
  return [...REGIONS];
}

function isZoomId(value: string): value is ZoomId {
  return ZOOM_LEVELS.some((level) => level.id === value);
}

function parseRegions(raw: string | null): Region[] {
  if (!raw) return defaultRegions();
  const wanted = raw
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is Region => (REGIONS as readonly string[]).includes(part));
  return wanted.length > 0 ? wanted : defaultRegions();
}

export function parseTimelineSearch(
  search: string,
  fallbackYear = 1517,
): TimelineUrlState {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const parsed = parseYearInput(params.get("y") ?? "");
  const year = clampYear(parsed ?? fallbackYear, YEAR_MIN, YEAR_MAX);
  const z = params.get("z") ?? "";
  const zoomId = isZoomId(z) ? z : DEFAULT_ZOOM;
  const regions = parseRegions(params.get("r"));
  const eventRaw = params.get("e");
  const eventId =
    eventRaw && getEventById(eventRaw) ? eventRaw : null;
  return { year, zoomId, regions, eventId };
}

export function serializeTimelineSearch(state: TimelineUrlState): string {
  const params = new URLSearchParams();
  params.set("y", String(state.year));
  if (state.zoomId !== DEFAULT_ZOOM) params.set("z", state.zoomId);
  const allOn =
    state.regions.length === REGIONS.length &&
    REGIONS.every((id) => state.regions.includes(id));
  if (!allOn && state.regions.length > 0) {
    params.set("r", state.regions.join(","));
  }
  if (state.eventId) params.set("e", state.eventId);
  return params.toString();
}

export function regionsFromFilter(filter: Record<Region, boolean>): Region[] {
  return REGIONS.filter((id) => filter[id]);
}

export function filterFromRegions(regions: Region[]): Record<Region, boolean> {
  const set = new Set(regions);
  return {
    christianity: set.has("christianity"),
    korea: set.has("korea"),
    east_asia: set.has("east_asia"),
    world: set.has("world"),
  };
}
