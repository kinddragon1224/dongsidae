import { create } from "zustand";
import { YEAR_MAX, YEAR_MIN } from "./catalog.ts";
import { DEFAULT_YEAR, ZOOM_LEVELS } from "./constants.ts";
import type { Region, ZoomId, ZoomLevel } from "./types.ts";
import { REGIONS } from "./types.ts";
import { addYears, clampYear, signedYearDistance } from "./years.ts";

export type RegionFilter = Record<Region, boolean>;

type TimelineState = {
  year: number;
  zoomId: ZoomId;
  selectedId: string | null;
  entered: boolean;
  searchOpen: boolean;
  explainOpen: boolean;
  yearInputOpen: boolean;
  regions: RegionFilter;
  lastJump: number;
  setYear: (year: number) => void;
  shift: (delta: number) => void;
  setZoom: (id: ZoomId) => void;
  cycleZoom: (dir: 1 | -1) => void;
  select: (id: string | null) => void;
  enter: (year?: number) => void;
  exitToIntro: () => void;
  setSearchOpen: (open: boolean) => void;
  setExplainOpen: (open: boolean) => void;
  setYearInputOpen: (open: boolean) => void;
  toggleRegion: (region: Region) => void;
  setRegions: (regions: RegionFilter) => void;
  goToEvent: (id: string, year: number) => void;
  hydrateFromUrl: (next: {
    year: number;
    zoomId: ZoomId;
    regions: RegionFilter;
    eventId: string | null;
    entered?: boolean;
  }) => void;
};

const allOn = (): RegionFilter => ({
  christianity: true,
  korea: true,
  east_asia: true,
  world: true,
});

function bound(year: number): number {
  return clampYear(year, YEAR_MIN, YEAR_MAX);
}

export const useTimeline = create<TimelineState>((set, get) => ({
  year: DEFAULT_YEAR,
  zoomId: "decade",
  selectedId: null,
  entered: false,
  searchOpen: false,
  explainOpen: false,
  yearInputOpen: false,
  regions: allOn(),
  lastJump: 0,
  setYear: (year) => {
    const next = bound(year);
    const prev = get().year;
    set({
      year: next,
      lastJump: signedYearDistance(prev, next),
      explainOpen: false,
    });
  },
  shift: (delta) => {
    const { year } = get();
    const next = bound(addYears(year, delta));
    set({
      year: next,
      lastJump: signedYearDistance(year, next),
      explainOpen: false,
    });
  },
  setZoom: (id) => set({ zoomId: id }),
  cycleZoom: (dir) => {
    const idx = ZOOM_LEVELS.findIndex((z) => z.id === get().zoomId);
    const next = ZOOM_LEVELS[idx + dir];
    if (next) set({ zoomId: next.id });
  },
  select: (id) => set({ selectedId: id }),
  enter: (year) =>
    set({
      entered: true,
      year: year != null ? bound(year) : get().year,
      selectedId: null,
      explainOpen: false,
    }),
  exitToIntro: () =>
    set({
      entered: false,
      selectedId: null,
      searchOpen: false,
      explainOpen: false,
      yearInputOpen: false,
    }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setExplainOpen: (open) => set({ explainOpen: open }),
  setYearInputOpen: (open) => set({ yearInputOpen: open }),
  toggleRegion: (region) => {
    const regions = { ...get().regions, [region]: !get().regions[region] };
    if (!REGIONS.some((key) => regions[key])) return;
    set({ regions });
  },
  setRegions: (regions) => {
    if (!REGIONS.some((key) => regions[key])) return;
    set({ regions });
  },
  goToEvent: (id, year) =>
    set({
      selectedId: id,
      year: bound(year),
      entered: true,
      searchOpen: false,
      explainOpen: false,
    }),
  hydrateFromUrl: (next) =>
    set({
      year: bound(next.year),
      zoomId: next.zoomId,
      regions: next.regions,
      selectedId: next.eventId,
      entered: next.entered ?? true,
      explainOpen: false,
    }),
}));

export function getZoom(zoomId: ZoomId): ZoomLevel {
  return ZOOM_LEVELS.find((z) => z.id === zoomId) ?? ZOOM_LEVELS[1]!;
}

export function useZoom(): ZoomLevel {
  const zoomId = useTimeline((s) => s.zoomId);
  return getZoom(zoomId);
}
