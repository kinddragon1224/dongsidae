import type { EventKind, Region } from "./types";

export const REGION_META: Record<
  Region,
  {
    id: Region;
    label: string;
    short: string;
    description: string;
    token: string;
  }
> = {
  christianity: {
    id: "christianity",
    label: "기독교사",
    short: "기독",
    description: "교회와 신학의 역사",
    token: "var(--color-region-christianity)",
  },
  korea: {
    id: "korea",
    label: "한반도",
    short: "한국",
    description: "한반도와 한국사",
    token: "var(--color-region-korea)",
  },
  east_asia: {
    id: "east_asia",
    label: "동아시아",
    short: "동아",
    description: "중국·일본을 중심으로 한 동아시아",
    token: "var(--color-region-east-asia)",
  },
  world: {
    id: "world",
    label: "세계사",
    short: "세계",
    description: "서아시아·유럽·아프리카와 지구적 전환",
    token: "var(--color-region-world)",
  },
};

export const KIND_LABEL: Record<EventKind, string> = {
  event: "사건",
  era: "시대",
  person: "인물",
  war: "전쟁",
  council: "공의회",
  work: "문헌",
};

export const CONFIDENCE_LABEL = {
  high: "연대 확실",
  medium: "대체로 확실",
  low: "연대 논쟁·전승",
} as const;
