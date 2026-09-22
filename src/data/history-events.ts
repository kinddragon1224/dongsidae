import { christianityEvents } from "./events/christianity.ts";
import { eastAsiaEvents } from "./events/east-asia.ts";
import { koreaEvents } from "./events/korea.ts";
import { worldEvents } from "./events/world.ts";
import { BATCH1_EVENTS } from "./events/batch1.ts";
import type { HistoryEvent } from "../lib/history/types.ts";

export const HISTORY_EVENTS: HistoryEvent[] = [
  ...christianityEvents,
  ...koreaEvents,
  ...eastAsiaEvents,
  ...worldEvents,
  ...BATCH1_EVENTS,
];

export const EVENT_COUNT = HISTORY_EVENTS.length;
