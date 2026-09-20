import { Chronosphere } from "@/components/visual/chronosphere";
import { HistoricalPortal } from "@/components/visual/historical-portal";
import { PORTALS } from "@/lib/visuals/registry";
import { useTimeline } from "@/lib/history/store";
import { useYearReveal } from "@/lib/visuals/transition-store";

export function IntroScreen() {
  const year = useTimeline((s) => s.year);
  const enter = useTimeline((s) => s.enter);
  const setYearInputOpen = useTimeline((s) => s.setYearInputOpen);
  const play = useYearReveal((s) => s.play);

  function openYear(next: number) {
    play(year, next, () => enter(next));
  }

  return (
    <main className="archive-space relative flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto bg-background text-foreground">
      <div aria-hidden className="archive-vignette pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[46%] h-px now-rule z-10"
      />

      <header className="relative z-20 flex items-center justify-between px-5 py-5 md:px-10">
        <p className="font-serif text-sm tracking-wide text-muted-foreground">동시대</p>
        <p className="text-xs tracking-wide text-subtle">같은 시간</p>
      </header>

      <div className="relative z-20 flex flex-1 flex-col px-5 pb-12 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col xl:max-w-7xl">
          <div className="stagger-in mx-auto max-w-2xl text-center">
            <h1 className="font-serif text-brand font-medium tracking-tight text-foreground">
              동시대
            </h1>
            <p className="mt-2 font-serif text-lg text-muted-foreground md:text-xl">
              같은 시간, 다른 세계.
            </p>
          </div>

          <div className="relative mx-auto mt-1 w-full max-w-xl md:mt-1 md:max-w-2xl lg:max-w-3xl">
            <Chronosphere onEnter={() => openYear(year)} />
          </div>

          <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-subtle">
            한 해를 고르면, 네 세계가 동시에 열린다.
          </p>

          <ul className="relative z-10 mt-5 grid w-full min-w-0 grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-4">
            {PORTALS.map((portal) => (
              <li key={portal.year} className="min-w-0">
                <HistoricalPortal portal={portal} onOpen={openYear} />
              </li>
            ))}
          </ul>

          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <button
              type="button"
              onClick={() => openYear(year)}
              className="flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground active:scale-[0.96]"
            >
              시간축 열기
            </button>
            <button
              type="button"
              onClick={() => {
                enter(year);
                setYearInputOpen(true);
              }}
              className="flex h-12 items-center justify-center rounded-lg border border-border px-6 text-sm text-muted-foreground hover:text-foreground"
            >
              다른 해 입력
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
