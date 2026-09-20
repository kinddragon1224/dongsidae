import { ArchiveImage } from "@/components/visual/archive-image";
import { REGION_META } from "@/lib/history/regions";
import type { HistoryEvent } from "@/lib/history/types";
import { visualForEvent } from "@/lib/visuals/registry";
import { formatYearBare, formatYearRange } from "@/lib/history/years";

export function ArtifactStage({ event }: { event: HistoryEvent }) {
  const visual = visualForEvent(event.id);
  const region = REGION_META[event.region];

  if (!visual) {
    return (
      <div className="artifact-empty relative overflow-hidden border-b border-border px-5 py-6">
        <p className="text-xs tracking-[0.22em] text-subtle">{region.label}</p>
        <p className="mt-2 font-serif text-4xl tabular-nums tracking-tight text-primary">
          {formatYearBare(event.startYear)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {event.approximate ? "약 " : ""}
          {formatYearRange(event.startYear, event.endYear)}
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-border">
      <ArchiveImage
        asset={visual}
        className="artifact-stage"
        imgClassName="h-32 w-full object-cover md:h-56"
        showCaption
        priority
      />
    </div>
  );
}
