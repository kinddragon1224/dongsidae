import { ERAS_BY_REGION, EVENTS_BY_ID, EVENTS_BY_REGION } from "./catalog.ts";
import { REGION_META } from "./regions.ts";
import { REGIONS, type HistoryEvent, type PresenceLabel, type Region } from "./types.ts";
import {
  distanceToYear,
  formatDistance,
  signedYearDistance,
  spansYear,
  yearsBetween,
} from "./years.ts";

export type ActiveItem = {
  event: HistoryEvent;
  status: "exact" | "ongoing";
  label: PresenceLabel;
};

export type NearbyItem = {
  event: HistoryEvent;
  years: number;
  direction: "before" | "after";
  label: string;
};

export type YearRegionSnapshot = {
  region: Region;
  activeEras: HistoryEvent[];
  exactEvents: HistoryEvent[];
  ongoingEvents: HistoryEvent[];
  active: ActiveItem[];
  nearbyBefore: NearbyItem[];
  nearbyAfter: NearbyItem[];
  headline: {
    title: string;
    label: string;
    event?: HistoryEvent;
  };
};

export type YearSnapshot = {
  year: number;
  regions: YearRegionSnapshot[];
};

export type SnapshotOptions = {
  nearbyRange?: number;
  nearbyLimit?: number;
};

const DEFAULT_NEARBY_RANGE = 12;
const DEFAULT_NEARBY_LIMIT = 4;

function spanLength(event: HistoryEvent): number {
  return yearsBetween(event.startYear, event.endYear ?? event.startYear);
}

function isPoint(event: HistoryEvent): boolean {
  return event.endYear == null || event.endYear === event.startYear;
}

export function eraPresenceLabel(event: HistoryEvent): PresenceLabel {
  if (event.categories.includes("왕") || event.categories.includes("황제")) {
    return "재위 중";
  }
  if (spanLength(event) <= 90) return "재위 중";
  return "시대";
}

export function activeLabel(event: HistoryEvent, year: number): PresenceLabel {
  if (event.kind === "era") return eraPresenceLabel(event);
  if (isPoint(event) || event.startYear === year) return "이 해";
  return "진행 중";
}

export function eventTimeLabel(event: HistoryEvent, year: number): string {
  if (spansYear(event.startYear, event.endYear, year)) {
    return activeLabel(event, year);
  }
  const target =
    signedYearDistance(year, event.startYear) > 0
      ? event.startYear
      : (event.endYear ?? event.startYear);
  return formatDistance(year, target);
}

function bySignificanceThenSpan(a: HistoryEvent, b: HistoryEvent): number {
  if (a.significance !== b.significance) return b.significance - a.significance;
  return spanLength(a) - spanLength(b);
}

function toNearby(event: HistoryEvent, year: number): NearbyItem {
  const years = distanceToYear(event.startYear, event.endYear, year);
  const after = signedYearDistance(year, event.startYear) > 0;
  const direction: NearbyItem["direction"] = after ? "after" : "before";
  const target = after ? event.startYear : (event.endYear ?? event.startYear);
  return {
    event,
    years,
    direction,
    label: formatDistance(year, target),
  };
}

export function getRegionSnapshot(
  region: Region,
  year: number,
  opts: SnapshotOptions = {},
): YearRegionSnapshot {
  const nearbyRange = opts.nearbyRange ?? DEFAULT_NEARBY_RANGE;
  const nearbyLimit = opts.nearbyLimit ?? DEFAULT_NEARBY_LIMIT;
  const pool = EVENTS_BY_REGION[region];

  const activeEras = ERAS_BY_REGION[region]
    .filter((event) => spansYear(event.startYear, event.endYear, year))
    .sort((a, b) => spanLength(a) - spanLength(b));

  const exactEvents: HistoryEvent[] = [];
  const ongoingEvents: HistoryEvent[] = [];
  const before: NearbyItem[] = [];
  const after: NearbyItem[] = [];

  for (const event of pool) {
    if (event.kind === "era") continue;
    if (spansYear(event.startYear, event.endYear, year)) {
      if (isPoint(event) || event.startYear === year) exactEvents.push(event);
      else ongoingEvents.push(event);
      continue;
    }
    const dist = distanceToYear(event.startYear, event.endYear, year);
    if (dist === 0 || dist > nearbyRange) continue;
    const item = toNearby(event, year);
    if (item.direction === "before") before.push(item);
    else after.push(item);
  }

  exactEvents.sort(bySignificanceThenSpan);
  ongoingEvents.sort(bySignificanceThenSpan);

  const nearbySort = (a: NearbyItem, b: NearbyItem) =>
    a.years - b.years || b.event.significance - a.event.significance;

  before.sort(nearbySort);
  after.sort(nearbySort);

  const nearbyBefore = before.slice(0, nearbyLimit);
  const nearbyAfter = after.slice(0, nearbyLimit);

  const active: ActiveItem[] = [
    ...exactEvents.map((event) => ({
      event,
      status: "exact" as const,
      label: activeLabel(event, year),
    })),
    ...activeEras.map((event) => ({
      event,
      status: "ongoing" as const,
      label: eraPresenceLabel(event),
    })),
    ...ongoingEvents.map((event) => ({
      event,
      status: "ongoing" as const,
      label: activeLabel(event, year),
    })),
  ];

  const headline = pickHeadline(active, nearbyBefore, nearbyAfter, year);

  return {
    region,
    activeEras,
    exactEvents,
    ongoingEvents,
    active,
    nearbyBefore,
    nearbyAfter,
    headline,
  };
}

function pickHeadline(
  active: ActiveItem[],
  nearbyBefore: NearbyItem[],
  nearbyAfter: NearbyItem[],
  _year: number,
): YearRegionSnapshot["headline"] {
  const exact = active.find((item) => item.status === "exact");
  if (exact) {
    return { title: exact.event.title, label: exact.label, event: exact.event };
  }
  const shortEra = active.find(
    (item) => item.event.kind === "era" && spanLength(item.event) <= 90,
  );
  if (shortEra) {
    return {
      title: shortEra.event.title,
      label: shortEra.label,
      event: shortEra.event,
    };
  }
  const era = active.find((item) => item.event.kind === "era");
  if (era) {
    return { title: era.event.title, label: era.label, event: era.event };
  }
  const ongoing = active.find((item) => item.status === "ongoing");
  if (ongoing) {
    return {
      title: ongoing.event.title,
      label: ongoing.label,
      event: ongoing.event,
    };
  }
  const nearest = [...nearbyBefore, ...nearbyAfter].sort(
    (a, b) => a.years - b.years || b.event.significance - a.event.significance,
  )[0];
  if (nearest) {
    return {
      title: nearest.event.title,
      label: nearest.label,
      event: nearest.event,
    };
  }
  return { title: "가까운 기록이 드뭅니다", label: "" };
}

export function getYearSnapshot(
  year: number,
  opts: SnapshotOptions = {},
): YearSnapshot {
  return {
    year,
    regions: REGIONS.map((region) => getRegionSnapshot(region, year, opts)),
  };
}

export function yearHeadline(year: number): string {
  const snap = getYearSnapshot(year, { nearbyRange: 20, nearbyLimit: 1 });
  const exact = snap.regions.find((row) =>
    row.active.some((item) => item.status === "exact"),
  );
  if (exact?.headline.event) return exact.headline.event.title;
  const strongest = [...snap.regions]
    .filter((row) => row.headline.event)
    .sort(
      (a, b) =>
        (b.headline.event?.significance ?? 0) -
        (a.headline.event?.significance ?? 0),
    )[0];
  return strongest?.headline.title ?? "같은 시간, 다른 세계";
}

export function relatedEvents(event: HistoryEvent): HistoryEvent[] {
  return (event.relatedEventIds ?? [])
    .map((id) => EVENTS_BY_ID.get(id))
    .filter((item): item is HistoryEvent => item != null && item.id !== event.id);
}

export type AiEventContext = {
  id: string;
  title: string;
  startYear: number;
  endYear?: number;
  region: string;
  regionLabel: string;
  summary: string;
  yearNote?: string;
  confidence: string;
  kind: string;
  layer: "exact" | "ongoing" | "nearby";
  label: string;
};

export function snapshotToAiContext(
  snap: YearSnapshot,
  limit = 28,
): AiEventContext[] {
  const out: AiEventContext[] = [];

  function push(
    event: HistoryEvent,
    layer: AiEventContext["layer"],
    label: string,
  ) {
    if (out.some((row) => row.id === event.id)) return;
    out.push({
      id: event.id,
      title: event.title,
      startYear: event.startYear,
      endYear: event.endYear,
      region: event.region,
      regionLabel: REGION_META[event.region].label,
      summary: event.summary,
      yearNote: event.yearNote,
      confidence: event.confidence,
      kind: event.kind,
      layer,
      label,
    });
  }

  for (const row of snap.regions) {
    for (const item of row.active) {
      if (item.status === "exact") push(item.event, "exact", item.label);
    }
  }
  for (const row of snap.regions) {
    for (const item of row.active) {
      if (item.status === "ongoing") push(item.event, "ongoing", item.label);
    }
  }
  for (const row of snap.regions) {
    for (const item of [...row.nearbyBefore, ...row.nearbyAfter]) {
      push(item.event, "nearby", item.label);
    }
  }

  return out.slice(0, limit);
}
