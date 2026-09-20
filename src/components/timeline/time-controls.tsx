import { YEAR_MAX, YEAR_MIN } from "@/lib/history/catalog";
import { ERA_SHORTCUTS, ZOOM_LEVELS } from "@/lib/history/constants";
import { useTimeline, useZoom } from "@/lib/history/store";
import {
  formatYearBare,
  sliderMaxValue,
  sliderToYear,
  yearToSlider,
} from "@/lib/history/years";
import { jumpThroughTime } from "@/lib/visuals/jump";
import { cn } from "@/lib/utils";

const STEPS = [-100, -10, -1, 1, 10, 100] as const;

export function TimeControls() {
  const year = useTimeline((s) => s.year);
  const shift = useTimeline((s) => s.shift);
  const setYear = useTimeline((s) => s.setYear);
  const setYearInputOpen = useTimeline((s) => s.setYearInputOpen);
  const zoomId = useTimeline((s) => s.zoomId);
  const setZoom = useTimeline((s) => s.setZoom);
  const zoom = useZoom();
  const sliderMax = sliderMaxValue(YEAR_MIN, YEAR_MAX);
  const sliderValue = yearToSlider(year, YEAR_MIN);

  function onScrub(raw: string) {
    setYear(sliderToYear(Number(raw), YEAR_MIN));
  }

  return (
    <div className="border-t border-border bg-background px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <div className="flex items-center gap-2 md:hidden">
          <StepButton step={-zoom.step} onClick={() => shift(-zoom.step)} />
          <input
            type="range"
            min={0}
            max={sliderMax}
            step={1}
            value={sliderValue}
            onChange={(e) => onScrub(e.target.value)}
            aria-label="연도 스크러버"
            className="year-scrubber min-h-11 min-w-0 flex-1"
          />
          <StepButton step={zoom.step} onClick={() => shift(zoom.step)} />
        </div>

        <div className="hidden items-center justify-center gap-1.5 md:flex md:gap-2">
          {STEPS.filter((s) => s < 0).map((step) => (
            <StepButton key={step} step={step} onClick={() => shift(step)} />
          ))}
          <button
            type="button"
            onClick={() => setYearInputOpen(true)}
            className="mx-1 min-h-11 min-w-16 rounded-md px-2 py-2 font-serif text-lg tabular-nums text-primary md:text-xl"
            aria-label="연도 입력"
          >
            {formatYearBare(year)}
          </button>
          {STEPS.filter((s) => s > 0).map((step) => (
            <StepButton key={step} step={step} onClick={() => shift(step)} />
          ))}
        </div>

        <input
          type="range"
          min={0}
          max={sliderMax}
          step={1}
          value={sliderValue}
          onChange={(e) => onScrub(e.target.value)}
          aria-label="연도 스크러버"
          className="year-scrubber hidden h-6 w-full md:block"
        />

        <div className="hidden items-center justify-between gap-3 md:flex">
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {ERA_SHORTCUTS.map((era) => (
              <button
                key={era.id}
                type="button"
                onClick={() => jumpThroughTime(era.year)}
                title={era.hint}
                className={cn(
                  "h-9 shrink-0 rounded-full px-2.5 text-[0.6875rem] tracking-wide",
                  year === era.year
                    ? "bg-primary text-primary-foreground"
                    : "text-subtle hover:text-foreground",
                )}
              >
                {era.label}
              </button>
            ))}
          </div>
          <div className="flex h-9 shrink-0 rounded-full border border-border p-0.5">
            {ZOOM_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => setZoom(level.id)}
                className={cn(
                  "rounded-full px-2.5 text-[0.6875rem]",
                  zoomId === level.id
                    ? "bg-secondary text-foreground"
                    : "text-subtle hover:text-foreground",
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepButton({
  step,
  onClick,
}: {
  step: number;
  onClick: () => void;
}) {
  const label = step > 0 ? `+${step}` : String(step);
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 min-w-11 rounded-md border border-border bg-card px-2 font-serif text-xs tabular-nums text-muted-foreground hover:text-foreground md:min-w-12"
    >
      {label}
    </button>
  );
}
