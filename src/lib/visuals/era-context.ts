import { EVENTS_BY_ID } from "../history/catalog.ts";
import { spansYear } from "../history/years.ts";
import { getVisualById } from "./registry.ts";
import type { HistoricalVisualAsset } from "./types.ts";

export type EraTexture = "antiquity" | "medieval" | "early-modern" | "modern";

export type EraBand = {
  id: string;
  startYear: number;
  endYear: number;
  texture: EraTexture;
  visualIds: string[];
};

export const ERA_BANDS: EraBand[] = [
  {
    id: "late-antiquity",
    startYear: 250,
    endYear: 400,
    texture: "antiquity",
    visualIds: ["nicaea-icon", "goguryeo-hunt", "luo-river", "constantine-head"],
  },
  {
    id: "three-kingdoms",
    startYear: -57,
    endYear: 668,
    texture: "antiquity",
    visualIds: ["goguryeo-hunt", "goguryeo-bird"],
  },
  {
    id: "medieval",
    startYear: 500,
    endYear: 1391,
    texture: "medieval",
    visualIds: [],
  },
  {
    id: "joseon-ming",
    startYear: 1392,
    endYear: 1600,
    texture: "early-modern",
    visualIds: ["luther-theses", "jungjong", "zhengde", "selim"],
  },
  {
    id: "opening",
    startYear: 1800,
    endYear: 1910,
    texture: "modern",
    visualIds: ["chemulpo-map", "underwood"],
  },
  {
    id: "wars",
    startYear: 1910,
    endYear: 1950,
    texture: "modern",
    visualIds: ["seoul-1945", "missouri"],
  },
];

export function eraTextureForYear(year: number): EraTexture {
  if (year < 500) return "antiquity";
  if (year < 1400) return "medieval";
  if (year < 1800) return "early-modern";
  return "modern";
}

export function eraBandForYear(year: number): EraBand {
  const hit = ERA_BANDS.find(
    (band) => year >= band.startYear && year <= band.endYear,
  );
  if (hit) return hit;
  return {
    id: "open",
    startYear: year,
    endYear: year,
    texture: eraTextureForYear(year),
    visualIds: [],
  };
}

function assetTouchesYear(asset: HistoricalVisualAsset, year: number): boolean {
  if (asset.years?.includes(year)) return true;
  if (
    asset.startYear != null &&
    asset.endYear != null &&
    year >= asset.startYear &&
    year <= asset.endYear
  ) {
    return true;
  }
  for (const eventId of asset.eventIds ?? []) {
    const event = EVENTS_BY_ID.get(eventId);
    if (event && spansYear(event.startYear, event.endYear, year)) return true;
  }
  return false;
}

/** Faint atmosphere only — never a stand-in for an unsourced event. */
export function eraWashForYear(year: number): HistoricalVisualAsset | undefined {
  const band = eraBandForYear(year);
  for (const id of band.visualIds) {
    const asset = getVisualById(id);
    if (asset && assetTouchesYear(asset, year)) return asset;
  }
  return undefined;
}
