export type VisualKind =
  | "image"
  | "manuscript"
  | "painting"
  | "photograph"
  | "map"
  | "none";

export type HistoricalVisualAsset = {
  id: string;
  type: Exclude<VisualKind, "none">;
  src: string;
  eventIds?: string[];
  years?: number[];
  startYear?: number;
  endYear?: number;
  title: string;
  alt: string;
  caption: string;
  source: string;
  sourceUrl: string;
  creator?: string;
  license: string;
  reconstruction: boolean;
  focalPoint?: { x: number; y: number };
};

export type PortalSpec = {
  year: number;
  title: string;
  archiveLabel: string;
  line: string;
  visualId: string;
};
