# 동시대

같은 시간, 다른 세계.

기독교사 · 한반도 · 동아시아 · 세계사를 **하나의 시간축**에서 동시에 보는 웹앱입니다.

연도를 움직이면 네 세계가 함께 움직입니다. 종교개혁 때 조선에서 무슨 일이 있었는지, 니케아 공의회 때 고구려가 어디 있었는지를 한 화면에서 직관적으로 보게 하는 것이 목적입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 개발 서버가 뜹니다. 프로덕션 빌드:

```bash
npm run build
npm run preview
```

AI 시대 설명(「이 시대를 설명해줘」)은 서버 환경변수 `XAI_API_KEY`가 있을 때만 켜집니다. 없어도 핵심 경험은 전부 동작합니다.

## 스택

- TanStack Start (Vite, App Router 역할의 파일 라우트)
- TypeScript strict
- Tailwind CSS v4
- zustand
- Radix / shadcn 스타일 컴포넌트
- Lucide icons

백엔드 DB 없이 정적 역사 데이터로 동작합니다. Vercel 배포를 전제로 빌드됩니다.

## 핵심 경험

1. 연도 이동 (버튼, 슬라이더, 키보드, 드래그)
2. 네 지역 병렬 비교
3. 사건 카드 → 상세 (동시대 사건, 전후 비교, 출처)
4. 검색
5. 모바일: 큰 연도 + 2×2 동시대 요약 + 지역별 가까운 사건

대표 연도: **325** 니케아 · **1517** 종교개혁 · **1885** 한국 선교 · **1945** 광복.

## 데이터

UI와 데이터가 분리되어 있습니다. 새 사건은 아래 파일에 추가하면 됩니다.

| 지역 | 파일 |
|------|------|
| 기독교사 | `src/data/events/christianity.ts` |
| 한반도 | `src/data/events/korea.ts` |
| 동아시아 | `src/data/events/east-asia.ts` |
| 세계사 | `src/data/events/world.ts` |

타입은 `src/lib/history/types.ts`, 조회는 `src/lib/history/query.ts`, 연도 산술은 `src/lib/history/years.ts` (기원전, 연도 0 없음).

**창작하지 말 것.** 날짜·사실·해석은 출처 있는 것만. 불확실하면 `approximate`, `yearNote`, `confidence`를 남깁니다.

## 구조

```
src/
  components/timeline/   시간축, 카드, 상세, 모바일
  components/search/     검색
  components/explain/    AI 설명 패널
  data/events/           지역별 시드
  lib/history/           타입 · 쿼리 · 스토어 · 연도
  lib/ai/explain.ts      서버 함수 (기록된 사건만 재료)
  routes/                TanStack 라우트
```

## 확장 여지 (아직 없음)

개인 메모, 즐겨찾기, 신학자 연표, 교회사 전용 모드, 지도, 관계 그래프, 학습 퀴즈.

핵심을 먼저 깊게 갈 것: **연도를 움직인다. 세계가 동시에 움직인다.**
