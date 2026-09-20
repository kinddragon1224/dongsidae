import { QUICK_START } from "@/lib/history/constants";
import { useTimeline } from "@/lib/history/store";
import { formatYearBare } from "@/lib/history/years";

export function IntroScreen() {
  const enter = useTimeline((s) => s.enter);
  const setYearInputOpen = useTimeline((s) => s.setYearInputOpen);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-y-auto bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[42%] h-px now-rule"
      />
      <header className="flex items-center justify-between px-5 py-6 md:px-10">
        <p className="font-serif text-sm tracking-wide text-muted-foreground">
          동시대
        </p>
        <p className="text-xs tracking-wide text-subtle">CHRONO</p>
      </header>

      <div className="flex flex-1 flex-col justify-center px-5 pb-10 md:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="stagger-in">
            <h1 className="font-serif text-brand font-medium tracking-tight text-foreground">
              동시대
            </h1>
            <p className="mt-3 font-serif text-lg text-muted-foreground md:text-xl">
              같은 시간, 다른 세계.
            </p>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-subtle">
              한 해를 움직이면, 기독교사와 한반도, 동아시아와 세계가 함께 움직입니다.
            </p>
          </div>

          <ul className="relative z-10 mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {QUICK_START.map((item) => (
              <li key={item.year}>
                <button
                  type="button"
                  onClick={() => enter(item.year)}
                  className="group flex min-h-32 w-full flex-col rounded-xl border border-border bg-card px-4 py-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform,background-color] duration-150 ease-out hover:shadow-[var(--shadow-border-hover)] active:scale-[0.98] md:min-h-36"
                >
                  <span className="font-serif text-3xl tabular-nums tracking-tight text-primary md:text-4xl">
                    {formatYearBare(item.year)}
                  </span>
                  <span className="mt-3 text-sm text-foreground">{item.title}</span>
                  <span className="mt-1 text-xs leading-relaxed text-subtle">
                    {item.line}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => enter(1517)}
              className="flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground active:scale-[0.98]"
            >
              시간축 열기
            </button>
            <button
              type="button"
              onClick={() => {
                enter(1517);
                setYearInputOpen(true);
              }}
              className="flex h-12 items-center justify-center rounded-lg border border-border px-5 text-sm text-muted-foreground hover:text-foreground"
            >
              다른 해 입력
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
