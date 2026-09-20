import type { HistoryEvent } from "@/lib/history/types";
import { REGION_META } from "@/lib/history/regions";
import { eventTimeLabel } from "@/lib/history/snapshot";
import { formatYearRange } from "@/lib/history/years";
import { visualForEvent } from "@/lib/visuals/registry";
import { cn } from "@/lib/utils";

type Props = {
  event: HistoryEvent;
  active?: boolean;
  compact?: boolean;
  currentYear?: number;
  onSelect?: (id: string) => void;
  label?: string;
};

export function EventCard({
  event,
  active,
  compact,
  currentYear,
  onSelect,
  label,
}: Props) {
  const region = REGION_META[event.region];
  const relative =
    label ?? (currentYear != null ? eventTimeLabel(event, currentYear) : null);
  const visual = !compact && active ? visualForEvent(event.id) : undefined;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(event.id)}
      className={cn(
        "w-full min-h-16 overflow-hidden rounded-lg border bg-card px-3.5 py-3.5 text-left shadow-[var(--shadow-border)]",
        "transition-[box-shadow,background-color,transform] duration-150 ease-out",
        "hover:shadow-[var(--shadow-border-hover)] active:scale-[0.96]",
        active ? "border-primary/40" : "border-border",
        compact && "min-h-12 py-2.5",
      )}
      style={{ borderLeftWidth: 2, borderLeftColor: region.token }}
    >
      {visual ? (
        <span aria-hidden className="mb-2 block h-12 overflow-hidden rounded-sm">
          <img
            src={visual.src}
            alt=""
            className="archive-photo h-full w-full object-cover"
          />
        </span>
      ) : null}
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-serif text-sm leading-snug text-foreground">
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
        <p className="mt-1.5 font-serif text-xs tabular-nums text-muted-foreground">
          {event.approximate ? "약 " : ""}
          {formatYearRange(event.startYear, event.endYear)}
        </p>
      )}
      {event.needsVerification && (
        <p className="mt-1.5 text-xs tracking-wide text-subtle">출처 확인 필요</p>
      )}
    </button>
  );
}
