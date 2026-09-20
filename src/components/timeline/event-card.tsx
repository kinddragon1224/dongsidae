import type { HistoryEvent } from "@/lib/history/types";
import { REGION_META } from "@/lib/history/regions";
import { distanceToYear, formatDistance, formatYearRange } from "@/lib/history/years";
import { cn } from "@/lib/utils";

type Props = {
  event: HistoryEvent;
  active?: boolean;
  compact?: boolean;
  currentYear?: number;
  onSelect?: (id: string) => void;
};

export function EventCard({
  event,
  active,
  compact,
  currentYear,
  onSelect,
}: Props) {
  const region = REGION_META[event.region];
  const dist =
    currentYear != null
      ? distanceToYear(event.startYear, event.endYear, currentYear)
      : null;
  const relative =
    dist == null
      ? null
      : dist === 0
        ? "이 해"
        : formatDistance(currentYear!, event.startYear);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(event.id)}
      className={cn(
        "w-full min-h-16 rounded-lg border bg-card px-3.5 py-3.5 text-left shadow-[var(--shadow-border)]",
        "transition-[box-shadow,background-color,transform] duration-150 ease-out",
        "hover:shadow-[var(--shadow-border-hover)] active:scale-[0.98]",
        active ? "border-primary/40" : "border-border",
        compact && "min-h-12 py-2.5",
      )}
      style={{ borderLeftWidth: 2, borderLeftColor: region.token }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-serif text-[0.95rem] leading-snug text-foreground">
          {event.title}
        </p>
        <p className="shrink-0 font-serif text-xs tabular-nums text-muted-foreground">
          {relative ?? (
            <>
              {event.approximate ? "약 " : ""}
              {formatYearRange(event.startYear, event.endYear)}
            </>
          )}
        </p>
      </div>
      {!compact && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-subtle">
          {event.summary}
        </p>
      )}
      {relative && (
        <p className="mt-1.5 font-serif text-[0.6875rem] tabular-nums text-muted-foreground">
          {event.approximate ? "약 " : ""}
          {formatYearRange(event.startYear, event.endYear)}
        </p>
      )}
      {event.yearNote && !relative && (
        <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">
          {event.approximate ? "연대 추정 · " : ""}
          {event.confidence === "low" ? "논쟁 있음" : event.yearNote}
        </p>
      )}
    </button>
  );
}
