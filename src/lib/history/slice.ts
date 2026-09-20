import { REGION_META } from "./regions.ts";
import { getYearSnapshot, type YearRegionSnapshot } from "./snapshot.ts";
import { REGIONS, type Region } from "./types.ts";

export type SlicePresence = "exact" | "reign" | "era" | "nearby" | "sparse";

export type TimeSliceRegion = {
  region: Region;
  title: string;
  label: string;
  presence: SlicePresence;
  eventId?: string;
  significance: number;
  ruler: boolean;
};

export type TimeSlice = {
  year: number;
  sentence: string;
  regions: TimeSliceRegion[];
  lead: TimeSliceRegion | null;
};

const SLICE_NEARBY = 80;

const PRESENCE_RANK: Record<SlicePresence, number> = {
  exact: 400,
  reign: 300,
  era: 200,
  nearby: 100,
  sparse: 0,
};

export function presenceFromHeadline(row: YearRegionSnapshot): SlicePresence {
  if (!row.headline.event) return "sparse";
  const label = row.headline.label;
  if (label === "이 해") return "exact";
  if (label === "재위 중") return "reign";
  if (label === "시대" || label === "진행 중") return "era";
  if (label.endsWith("년 전") || label.endsWith("년 후") || label === "같은 해") {
    return label === "같은 해" ? "exact" : "nearby";
  }
  return "nearby";
}

export function hasBatchim(word: string): boolean {
  const chars = [...word].reverse();
  const hangul = chars.find((ch) => {
    const code = ch.charCodeAt(0);
    return code >= 0xac00 && code <= 0xd7a3;
  });
  if (!hangul) return false;
  return (hangul.charCodeAt(0) - 0xac00) % 28 !== 0;
}

export function iGa(word: string): string {
  return hasBatchim(word) ? "이" : "가";
}

export function eunNeun(word: string): string {
  return hasBatchim(word) ? "은" : "는";
}

function copulaPast(word: string): string {
  return hasBatchim(word) ? "이었습니다" : "였습니다";
}

function toSliceRegion(row: YearRegionSnapshot): TimeSliceRegion {
  const presence = presenceFromHeadline(row);
  const event = row.headline.event;
  const ruler = Boolean(
    event?.categories.includes("왕") || event?.categories.includes("황제"),
  );
  return {
    region: row.region,
    title: row.headline.title,
    label: row.headline.label,
    presence,
    eventId: event?.id,
    significance: event?.significance ?? 0,
    ruler,
  };
}

function rank(row: TimeSliceRegion): number {
  return PRESENCE_RANK[row.presence] + row.significance * 10;
}

export function pickLead(regions: TimeSliceRegion[]): TimeSliceRegion | null {
  const ranked = regions
    .filter((row) => row.presence !== "sparse")
    .sort((a, b) => rank(b) - rank(a) || REGIONS.indexOf(a.region) - REGIONS.indexOf(b.region));
  return ranked[0] ?? null;
}

function leadClause(row: TimeSliceRegion): string {
  const t = row.title;
  const p = iGa(t);
  if (row.presence === "exact") return `${t}${p} 있던 해`;
  if (row.presence === "reign" && row.ruler) return `${t}${p} 재위하던 시기`;
  if (row.presence === "nearby") return `${t}${p} ${row.label}이던 시기`;
  return `${t} 시기`;
}

function companionClause(row: TimeSliceRegion): string | null {
  if (row.presence === "sparse") return null;
  const place = REGION_META[row.region].label;
  const t = row.title;
  const p = iGa(t);
  if (row.presence === "exact") {
    return `${place}에서는 ${t}${p} 있었습니다`;
  }
  if (row.presence === "reign" && row.ruler) {
    return `${place}에서는 ${t}${p} 재위하고 있었습니다`;
  }
  if (row.presence === "nearby") {
    return `${place}에서는 ${t}${p} ${row.label}${copulaPast(row.label)}`;
  }
  return `${place}${eunNeun(place)} ${t}${copulaPast(t)}`;
}

export function pickCompanions(
  lead: TimeSliceRegion,
  regions: TimeSliceRegion[],
): TimeSliceRegion[] {
  const rest = regions.filter(
    (row) => row.region !== lead.region && row.presence !== "sparse",
  );
  const current = rest.filter(
    (row) => row.presence === "exact" || (row.presence === "reign" && row.ruler),
  );
  const eras = rest.filter(
    (row) =>
      row.presence === "era" || (row.presence === "reign" && !row.ruler),
  );
  const nearby = rest.filter((row) => row.presence === "nearby");
  return [...current, ...eras, ...nearby].slice(0, 2);
}

export function buildTimeSliceSentence(regions: TimeSliceRegion[]): string {
  const lead = pickLead(regions);
  if (!lead) return "같은 시간, 다른 세계.";

  const companions = pickCompanions(lead, regions)
    .map(companionClause)
    .filter((line): line is string => Boolean(line));

  if (companions.length === 0) return `${leadClause(lead)}.`;
  if (companions.length === 1) return `${leadClause(lead)}, ${companions[0]}.`;
  return `${leadClause(lead)}, ${companions[0]} 그리고 ${companions[1]}.`;
}

export function buildTimeSlice(year: number): TimeSlice {
  const snap = getYearSnapshot(year, {
    nearbyRange: SLICE_NEARBY,
    nearbyLimit: 1,
  });
  const regions = snap.regions.map(toSliceRegion);
  const lead = pickLead(regions);
  return {
    year,
    sentence: buildTimeSliceSentence(regions),
    regions,
    lead,
  };
}
