import { christianityEvents } from "@/data/events/christianity";
import { eastAsiaEvents } from "@/data/events/east-asia";
import { koreaEvents } from "@/data/events/korea";
import { worldEvents } from "@/data/events/world";
import type { HistoryEvent } from "@/lib/history/types";

export const HISTORY_EVENTS: HistoryEvent[] = [
  ...christianityEvents,
  ...koreaEvents,
  ...eastAsiaEvents,
  ...worldEvents,
];

export const EVENT_COUNT = HISTORY_EVENTS.length;
