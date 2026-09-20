export const REGIONS = ["christianity", "korea", "east_asia", "world"] as const;
export type Region = (typeof REGIONS)[number];

export type EventKind =
  | "event"
  | "era"
  | "person"
  | "war"
  | "council"
  | "work";

export type Confidence = "high" | "medium" | "low";
export type Significance = 1 | 2 | 3 | 4 | 5;

export type Source = {
  title: string;
  author?: string;
  publisher?: string;
  url?: string;
  year?: number;
};

export type HistoryEvent = {
  id: string;
  title: string;
  startYear: number;
  endYear?: number;
  approximate?: boolean;
  yearNote?: string;
  region: Region;
  kind: EventKind;
  significance: Significance;
  categories: string[];
  summary: string;
  description?: string;
  meaning?: string;
  people?: string[];
  relatedEventIds?: string[];
  sources?: Source[];
  confidence: Confidence;
  tags?: string[];
};

export type ZoomId = "year" | "decade" | "halfcentury" | "century" | "era";

export type ZoomLevel = {
  id: ZoomId;
  label: string;
  step: number;
  halfWindow: number;
  tick: number;
  maxCards: number;
};

export type EraShortcut = {
  id: string;
  label: string;
  year: number;
  hint: string;
};
