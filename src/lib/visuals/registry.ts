import { PORTALS, VISUAL_ASSETS } from "../../data/visuals/assets.ts";
import type { HistoricalVisualAsset, PortalSpec } from "./types.ts";

const BY_ID = new Map(VISUAL_ASSETS.map((asset) => [asset.id, asset]));

const BY_EVENT = new Map<string, HistoricalVisualAsset[]>();
for (const asset of VISUAL_ASSETS) {
  for (const eventId of asset.eventIds ?? []) {
    const list = BY_EVENT.get(eventId) ?? [];
    list.push(asset);
    BY_EVENT.set(eventId, list);
  }
}

const BY_YEAR = new Map<number, HistoricalVisualAsset[]>();
for (const asset of VISUAL_ASSETS) {
  for (const year of asset.years ?? []) {
    const list = BY_YEAR.get(year) ?? [];
    list.push(asset);
    BY_YEAR.set(year, list);
  }
}

export function getVisualById(id: string): HistoricalVisualAsset | undefined {
  return BY_ID.get(id);
}

export function visualForEvent(eventId: string): HistoricalVisualAsset | undefined {
  return BY_EVENT.get(eventId)?.[0];
}

export function visualsForEvent(eventId: string): HistoricalVisualAsset[] {
  return BY_EVENT.get(eventId) ?? [];
}

export function visualForYear(year: number): HistoricalVisualAsset | undefined {
  return BY_YEAR.get(year)?.[0];
}

export function portalForYear(year: number): PortalSpec | undefined {
  return PORTALS.find((portal) => portal.year === year);
}

export { PORTALS, VISUAL_ASSETS };
