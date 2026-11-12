import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Globe, type GlobeMark } from "@/components/visual/globe";
import { DEFAULT_YEAR, ERA_SHORTCUTS } from "@/lib/history/constants";
import { getEventById } from "@/lib/history/query";
import { REGION_META } from "@/lib/history/regions";
import { buildTimeSlice } from "@/lib/history/slice";
import { useTimeline } from "@/lib/history/store";
import { REGIONS } from "@/lib/history/types";
import { formatYear, formatYearBare } from "@/lib/history/years";
import { useYearReveal } from "@/lib/visuals/transition-store";
import { cn } from "@/lib/utils";

/** 마지막으로 본 해. app-shell이 기록한다. */
export const LAST_YEAR_KEY = "dongsidae:last-year";

/**
 * 홈 = 공부의 출발점.
 * 위: 이어서 보기(마지막 해의 한 문장) / 아래: 동시대 연표(한 줄이 한 해, 가로로 네 세계).
 */
export function IntroScreen() {
  const year = useTimeline((s) => s.year);
  const enter = useTimeline((s) => s.enter);
  const select = useTimeline((s) => s.select);
  const setSearchOpen = useTimeline((s) => s.setSearchOpen);
  const setYearInputOpen = useTimeline((s) => s.setYearInputOpen);
  const play = useYearReveal((s) => s.play);

  // 저장된 해는 마운트 뒤에 읽는다 (SSR 결과와 어긋나지 않게)
  const [lastYear, setLastYear] = useState<number | null>(null);
  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(LAST_YEAR_KEY));
      if (Number.isInteger(saved) && saved !== 0) setLastYear(saved);
    } catch {
      // 저장소를 못 쓰는 환경이면 기본 해로 시작
    }
  }, []);

  // 지구본과 문장이 보여주는 해. 고르기 전에는 마지막으로 본 해.
  const [picked, setPicked] = useState<number | null>(null);
  const resumeYear = picked ?? lastYear ?? DEFAULT_YEAR;
  const resume = useMemo(() => buildTimeSlice(resumeYear), [resumeYear]);
  const places = useMemo(
    () =>
      resume.regions.map((row) => ({
        row,
        place: row.eventId ? getEventById(row.eventId)?.place : undefined,
      })),
    [resume],
  );
  const marks = useMemo<GlobeMark[]>(
    () =>
      places.flatMap(({ row, place }) =>
        place && row.eventId
          ? [
              {
                id: row.eventId,
                name: place.name,
                lat: place.lat,
                lng: place.lng,
                color: REGION_META[row.region].token,
                label: `${REGION_META[row.region].label} ${row.title}, ${place.name}`,
              },
            ]
          : [],
      ),
    [places],
  );
  const heroLabel =
    picked == null
      ? lastYear
        ? "이어서 보기"
        : "여기서 시작"
      : (ERA_SHORTCUTS.find((era) => era.year === picked)?.hint ?? "이 해의 세계");
  const rows = useMemo(
    () => ERA_SHORTCUTS.map((era) => ({ era, slice: buildTimeSlice(era.year) })),
    [],
  );

  function openYear(next: number, eventId?: string) {
    play(year, next, () => {
      enter(next);
      if (eventId) select(eventId);
    });
  }

  return (
    <main className="archive-space relative min-h-dvh overflow-x-clip bg-background text-foreground">
      <div aria-hidden className="archive-vignette pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 md:px-8">
        <header className="flex items-center justify-between gap-4 py-5">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="font-serif text-2xl font-medium tracking-tight whitespace-nowrap text-foreground">
              동시대
            </h1>
            <p className="hidden truncate font-serif text-sm text-muted-foreground sm:block">
              같은 시간, 다른 세계.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground"
            >
              <Search className="size-4" aria-hidden />
              <span className="hidden sm:inline">사건·인물 검색</span>
              <span className="sr-only sm:hidden">검색</span>
            </button>
            <button
              type="button"
              onClick={() => {
                enter(year);
                setYearInputOpen(true);
              }}
              className="flex h-10 items-center rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground"
            >
              연도 입력
            </button>
          </div>
        </header>

        <section
          aria-label="이 해의 세계"
          className="mt-2 rounded-xl border border-border bg-card/70 md:mt-6"
        >
          {/* 해 고르기 — 지구본과 문장이 따라 바뀐다 */}
          <div
            role="group"
            aria-label="해 고르기"
            className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2.5 [scrollbar-width:none] md:flex-wrap md:px-5"
          >
            {ERA_SHORTCUTS.map((era) => {
              const active = era.year === resumeYear;
              return (
                <button
                  key={era.id}
                  type="button"
                  aria-pressed={active}
                  title={era.hint}
                  onClick={() => setPicked(era.year)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs whitespace-nowrap",
                    active
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="font-serif tabular-nums">{formatYearBare(era.year)}</span>
                  <span className="ml-1.5">{era.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-2 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-center md:gap-8 md:p-8">
            <div className="min-w-0">
              <p className="text-xs tracking-[0.22em] text-subtle">{heroLabel}</p>
              <p className="mt-3 font-serif text-5xl font-medium tracking-tight text-primary tabular-nums md:text-6xl">
                {formatYear(resumeYear)}
              </p>
              <p className="mt-3 font-serif text-base leading-relaxed text-foreground md:text-lg">
                {resume.sentence}
              </p>

              {/* 어디에서 — 지구본의 점과 같은 정보를 글로 */}
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {places.map(({ row, place }) => {
                  const meta = REGION_META[row.region];
                  return (
                    <li key={row.region}>
                      <button
                        type="button"
                        onClick={() => openYear(resumeYear, row.eventId)}
                        className="chronicle-cell flex w-full items-baseline gap-3 px-1 py-2.5 text-left"
                      >
                        <span className="flex w-16 shrink-0 items-center gap-1.5">
                          <span
                            className="size-1.5 rounded-full"
                            style={{ background: meta.token }}
                          />
                          <span className="text-xs text-muted-foreground">{meta.label}</span>
                        </span>
                        <span className="min-w-0 flex-1 truncate font-serif text-sm text-foreground">
                          {row.title}
                        </span>
                        {place ? (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {place.name}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={() => openYear(resumeYear)}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground active:scale-[0.96] sm:w-auto"
              >
                {formatYear(resumeYear)} 시간축 열기
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>

            <Globe
              marks={marks}
              onOpen={(id) => openYear(resumeYear, id)}
              className="order-first mx-auto aspect-square w-full max-w-[20rem] md:order-none md:max-w-none"
            />
          </div>
        </section>

        <section aria-labelledby="chronicle-title" className="mt-10 md:mt-14">
          <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
            <h2 id="chronicle-title" className="font-serif text-xl text-foreground">
              동시대 연표
            </h2>
            <p className="text-sm text-muted-foreground">
              한 줄이 한 해입니다. 가로로 읽으면 같은 시간의 네 세계가 보입니다.
            </p>
          </div>

          {/* 열 머리 — 넓은 화면에서만. 좁은 화면은 칸마다 지역 이름을 단다 */}
          <div
            aria-hidden
            className="sticky top-0 z-20 mt-4 hidden grid-cols-[8.5rem_repeat(4,minmax(0,1fr))] border-b border-border bg-background py-2.5 md:grid"
          >
            <span className="px-3 text-xs tracking-wide text-subtle">해</span>
            {REGIONS.map((region) => (
              <span key={region} className="flex items-center gap-2 px-3">
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: REGION_META[region].token }}
                />
                <span className="font-serif text-sm text-foreground">
                  {REGION_META[region].label}
                </span>
              </span>
            ))}
          </div>

          <ol className="mt-3 space-y-3 md:mt-0 md:space-y-0">
            {rows.map(({ era, slice }) => (
              <li
                key={era.id}
                className={cn(
                  "grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card/50",
                  "md:grid-cols-[8.5rem_repeat(4,minmax(0,1fr))] md:rounded-none md:border-x-0 md:border-t-0 md:bg-transparent",
                  era.year === lastYear && "md:bg-card/60",
                )}
              >
                <button
                  type="button"
                  onClick={() => openYear(era.year)}
                  title={era.hint}
                  className="chronicle-cell col-span-2 flex items-baseline gap-3 border-b border-border px-3 py-3 text-left md:col-span-1 md:block md:border-b-0"
                >
                  <span className="font-serif text-2xl font-medium text-primary tabular-nums">
                    {formatYear(era.year)}
                  </span>
                  <span className="block text-xs text-muted-foreground md:mt-0.5">
                    {era.label}
                  </span>
                </button>
                {slice.regions.map((row) => {
                  const meta = REGION_META[row.region];
                  const exact = row.presence === "exact";
                  return (
                    <button
                      key={row.region}
                      type="button"
                      onClick={() => openYear(era.year, row.eventId)}
                      className="chronicle-cell min-w-0 px-3 py-3 text-left md:border-l md:border-border"
                    >
                      <span className="flex items-center gap-1.5 md:hidden">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ background: meta.token }}
                        />
                        <span className="text-xs text-subtle">{meta.label}</span>
                      </span>
                      <span
                        className={cn(
                          "mt-1 line-clamp-2 block font-serif text-sm leading-snug md:mt-0",
                          exact ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {row.title}
                      </span>
                      {row.label ? (
                        <span
                          className="mt-1 block text-xs"
                          style={{ color: exact ? meta.token : "var(--color-subtle)" }}
                        >
                          {row.label}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </li>
            ))}
          </ol>

          <p className="mt-6 text-sm text-muted-foreground">
            여기 없는 해는 「연도 입력」이나 검색으로 바로 갈 수 있습니다.
          </p>
        </section>
      </div>
    </main>
  );
}
