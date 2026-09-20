import type {
  Confidence,
  EventKind,
  HistoryEvent,
  Region,
  Significance,
  Source,
} from "../lib/history/types.ts";

export type EventDraft = {
  id: string;
  title: string;
  startYear: number;
  endYear?: number;
  approximate?: boolean;
  yearNote?: string;
  kind?: EventKind;
  significance?: Significance;
  categories?: string[];
  summary: string;
  description?: string;
  meaning?: string;
  people?: string[];
  relatedEventIds?: string[];
  sources?: Source[];
  confidence?: Confidence;
  tags?: string[];
  needsVerification?: boolean;
};

export function defineEvents(
  region: Region,
  drafts: EventDraft[],
): HistoryEvent[] {
  return drafts.map((draft) => {
    const sources = draft.sources;
    const hasSources = Boolean(sources && sources.length > 0);
    return {
      region,
      kind: draft.kind ?? "event",
      significance: draft.significance ?? 3,
      categories: draft.categories ?? [],
      confidence: draft.confidence ?? "high",
      ...draft,
      sources,
      needsVerification: draft.needsVerification ?? !hasSources,
    };
  });
}

export const S = {
  britannica: (title: string, url?: string): Source => ({
    title: `Encyclopaedia Britannica: ${title}`,
    url,
  }),
  wiki: (title: string, url: string): Source => ({
    title,
    url,
  }),
  nks: (title: string): Source => ({
    title,
    publisher: "국사편찬위원회 / 한국사 표준 연표 관례",
  }),
  church: (title: string): Source => ({
    title,
    publisher: "교회사 표준 서술",
  }),
};
