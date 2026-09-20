import { useTimeline } from "@/lib/history/store";
import { useYearReveal } from "@/lib/visuals/transition-store";

/** Discrete year jump. Scrubbing still uses setYear directly. */
export function jumpThroughTime(to: number, extra?: () => void) {
  const from = useTimeline.getState().year;
  useYearReveal.getState().play(from, to, () => {
    useTimeline.getState().setYear(to);
    extra?.();
  });
}
