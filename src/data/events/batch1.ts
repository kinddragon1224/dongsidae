import type { HistoryEvent } from "../lib/history/types.ts";
import { batch1Christianity } from "./batch1Christianity.ts";
import { batch1Korea } from "./batch1Korea.ts";
import { batch1EastAsia } from "./batch1EastAsia.ts";
import { batch1World } from "./batch1World.ts";

/** Batch 1 densification: 1592 · 1885 · 1910 · 1919 (additive packs). */
export const BATCH1_EVENTS: HistoryEvent[] = [
  ...batch1Christianity,
  ...batch1Korea,
  ...batch1EastAsia,
  ...batch1World,
];
