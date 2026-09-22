import type { EraShortcut, ZoomLevel } from "./types";

export const DEFAULT_YEAR = 1517;

export const ZOOM_LEVELS: ZoomLevel[] = [
  { id: "year", label: "1년", step: 1, halfWindow: 14, tick: 1, maxCards: 10 },
  {
    id: "decade",
    label: "10년",
    step: 10,
    halfWindow: 70,
    tick: 10,
    maxCards: 8,
  },
  {
    id: "halfcentury",
    label: "50년",
    step: 50,
    halfWindow: 220,
    tick: 50,
    maxCards: 7,
  },
  {
    id: "century",
    label: "100년",
    step: 100,
    halfWindow: 420,
    tick: 100,
    maxCards: 6,
  },
  { id: "era", label: "세기", step: 100, halfWindow: 700, tick: 100, maxCards: 5 },
];

export const ERA_SHORTCUTS: EraShortcut[] = [
  { id: "apostolic", label: "초대교회", year: 30, hint: "예수와 사도 시대" },
  { id: "nicaea", label: "니케아", year: 325, hint: "첫 보편 공의회 · 부활절 통일" },
  { id: "chalcedon", label: "칼케돈", year: 451, hint: "그리스도론의 경계" },
  { id: "medieval", label: "중세", year: 800, hint: "카롤링거와 통일신라" },
  { id: "schism", label: "동서 분열", year: 1054, hint: "교회 분열 · 고려" },
  { id: "joseon", label: "조선", year: 1392, hint: "이성계의 개국" },
  { id: "reformation", label: "종교개혁", year: 1517, hint: "95개조 · 중종 · 정덕" },
  { id: "imjin", label: "임진왜란", year: 1592, hint: "동아시아 전쟁" },
  { id: "opening", label: "개항기", year: 1876, hint: "강화도 조약" },
  { id: "mission", label: "한국 선교", year: 1885, hint: "개신교 선교의 시작" },
  { id: "occupation", label: "일제강점기", year: 1910, hint: "국권 피탈" },
  { id: "liberation", label: "광복", year: 1945, hint: "해방 · 유엔 · 세계 평화의 날" },
  { id: "modern", label: "현대", year: 1987, hint: "민주화" },
  { id: "nowish", label: "탈냉전", year: 1991, hint: "소련 해체" },
];

export const QUICK_START = [
  {
    year: 1517,
    title: "종교개혁",
    line: "루터가 논제를 낼 때, 조선은 중종 연간이었다. (오늘 모닝)",
  },
  {
    year: 1592,
    title: "임진왜란",
    line: "조선·명·일본이 한꺼번에 전쟁으로 얽힌 해.",
  },
  {
    year: 1885,
    title: "선교",
    line: "제물포 상륙과 톈진조약이 같은 해에 겹쳤다.",
  },
  {
    year: 1919,
    title: "3·1",
    line: "만세와 5·4, 베르사유가 한 해에 만났다.",
  },
] as const;

export const SEARCH_HINTS = [
  "루터",
  "조선",
  "니케아",
  "선교",
  "임진왜란",
  "3·1",
  "병합",
  "바르트",
  "톈진",
];
