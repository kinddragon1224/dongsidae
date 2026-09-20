import { useEffect } from "react";
import { formatYearBare, signedYearDistance, yearsBetween } from "@/lib/history/years";
import { useYearReveal } from "@/lib/visuals/transition-store";
import { visualForYear } from "@/lib/visuals/registry";

export function TimeTransition() {
  const reveal = useYearReveal((s) => s.reveal);
  const finish = useYearReveal((s) => s.finish);

  useEffect(() => {
    if (!reveal?.active) return;
    const id = window.setTimeout(finish, 680);
    return () => window.clearTimeout(id);
  }, [reveal, finish]);

  if (!reveal?.active) return null;
  const visual = visualForYear(reveal.to);
  const gap = yearsBetween(reveal.from, reveal.to);
  const later = signedYearDistance(reveal.from, reveal.to) > 0;
  const distance =
    gap === 0
      ? "같은 해"
      : `${gap.toLocaleString("ko-KR")}년 ${later ? "후" : "전"}`;

  return (
    <div
      aria-hidden
      className="time-reveal pointer-events-none fixed inset-0 z-[70] flex items-center justify-center"
    >
      {visual && (
        <img
          src={visual.src}
          alt=""
          className="archive-photo time-reveal-image"
          style={{
            objectPosition: visual.focalPoint
              ? `${visual.focalPoint.x * 100}% ${visual.focalPoint.y * 100}%`
              : "50% 40%",
          }}
        />
      )}
      <div className="time-reveal-veil" />
      <div className="relative text-center">
        <p className="font-serif text-sm tabular-nums text-subtle">
          {formatYearBare(reveal.from)}
        </p>
        <p className="mt-1 font-serif text-sm tabular-nums tracking-wide text-muted-foreground">
          {distance}
        </p>
        <p className="mt-2 font-serif text-year tabular-nums tracking-tight text-primary">
          {formatYearBare(reveal.to)}
        </p>
      </div>
    </div>
  );
}
