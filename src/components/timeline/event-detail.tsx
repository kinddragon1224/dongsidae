import { ArrowLeft, ArrowRight, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEventById } from "@/lib/history/query";
import { getYearSnapshot, relatedEvents } from "@/lib/history/snapshot";
import { CONFIDENCE_LABEL, KIND_LABEL, REGION_META } from "@/lib/history/regions";
import { useTimeline } from "@/lib/history/store";
import { REGIONS } from "@/lib/history/types";
import {
  addYears,
  formatDistance,
  formatYear,
  formatYearRange,
} from "@/lib/history/years";
import { cn } from "@/lib/utils";

export function EventDetail() {
  const selectedId = useTimeline((s) => s.selectedId);
  const select = useTimeline((s) => s.select);
  const event = selectedId ? getEventById(selectedId) : undefined;

  return (
    <Dialog
      open={Boolean(event)}
      onOpenChange={(open) => {
        if (!open) select(null);
      }}
    >
      {event ? <DetailBody eventId={event.id} /> : null}
    </Dialog>
  );
}

function DetailBody({ eventId }: { eventId: string }) {
  const select = useTimeline((s) => s.select);
  const setYear = useTimeline((s) => s.setYear);
  const event = getEventById(eventId);
  if (!event) return null;
  const current = event;
  const region = REGION_META[current.region];
  const related = relatedEvents(current);
  const world = getYearSnapshot(current.startYear, {
    nearbyRange: 10,
    nearbyLimit: 3,
  });
  const beforeYear = addYears(current.startYear, -50);
  const afterYear = addYears(current.startYear, 50);

  return (
    <DialogContent
      overlayClassName="bg-background/50 md:right-[28rem] md:bg-background/25"
      className={cn(
        "inset-x-0 bottom-0 flex max-h-[88vh] w-full flex-col rounded-t-xl border-t p-0",
        "md:inset-y-0 md:right-0 md:left-auto md:w-[28rem] md:rounded-none md:border-t-0 md:border-l",
      )}
      aria-describedby="event-summary"
    >
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border md:hidden" />
      <div className="relative flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-[0.6875rem] tracking-wide text-subtle">
            {region.label} · {KIND_LABEL[current.kind]}
          </p>
          <DialogTitle className="mt-1 font-serif text-xl leading-snug text-foreground">
            {current.title}
          </DialogTitle>
          <DialogDescription className="mt-1 font-serif text-sm tabular-nums text-muted-foreground">
            {current.approximate ? "약 " : ""}
            {formatYearRange(current.startYear, current.endYear)}
          </DialogDescription>
        </div>
        <DialogCloseButton />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p id="event-summary" className="text-sm leading-relaxed text-foreground">
          {current.summary}
        </p>
        {current.description && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {current.description}
          </p>
        )}
        {current.meaning && (
          <section className="mt-6">
            <h3 className="text-[0.6875rem] tracking-wide text-subtle">
              시대적 의미
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {current.meaning}
            </p>
          </section>
        )}

        <div className="mt-5 flex flex-wrap gap-1.5">
          <Badge variant="outline">{CONFIDENCE_LABEL[current.confidence]}</Badge>
          {current.approximate && <Badge variant="outline">대략적 연대</Badge>}
          {current.needsVerification && (
            <Badge variant="outline">출처 확인 필요</Badge>
          )}
          {current.yearNote && <Badge variant="outline">주기 있음</Badge>}
          {current.tags?.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        {current.yearNote && (
          <p className="mt-3 text-xs leading-relaxed text-subtle">
            {current.yearNote}
          </p>
        )}

        {current.people && current.people.length > 0 && (
          <section className="mt-6">
            <h3 className="text-[0.6875rem] tracking-wide text-subtle">
              관련 인물
            </h3>
            <p className="mt-2 text-sm text-foreground">
              {current.people.join(" · ")}
            </p>
          </section>
        )}

        <section className="mt-8">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[0.6875rem] tracking-wide text-subtle">
              {formatYear(current.startYear)}의 세계
            </h3>
            <Button
              variant="link"
              size="sm"
              className="h-11 px-2"
              onClick={() => {
                setYear(current.startYear);
                select(null);
              }}
            >
              이 해로 이동
            </Button>
          </div>
          <div className="mt-3 space-y-4">
            {world.regions.map((row) => {
              const active = row.active.filter((item) => item.event.id !== current.id);
              const nearby = [...row.nearbyBefore, ...row.nearbyAfter].filter(
                (item) => item.event.id !== current.id,
              );
              if (active.length === 0 && nearby.length === 0) return null;
              return (
                <div key={row.region}>
                  <p className="mb-1.5 flex items-center gap-2 text-[0.6875rem] tracking-wide text-subtle">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: REGION_META[row.region].token }}
                    />
                    {REGION_META[row.region].label}
                  </p>
                  <ul className="space-y-0.5">
                    {active.map((item) => (
                      <PeerRow
                        key={item.event.id}
                        title={item.event.title}
                        label={item.label}
                        solid
                        onClick={() => select(item.event.id)}
                      />
                    ))}
                    {nearby.map((item) => (
                      <PeerRow
                        key={item.event.id}
                        title={item.event.title}
                        label={item.label}
                        solid={false}
                        onClick={() => select(item.event.id)}
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-[0.6875rem] tracking-wide text-subtle">
            전후 비교
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
            <CompareColumn
              year={beforeYear}
              caption="50년 전"
              onJump={() => setYear(beforeYear)}
            />
            <CompareColumn
              year={current.startYear}
              caption="이 사건"
              current
              onJump={() => setYear(current.startYear)}
            />
            <CompareColumn
              year={afterYear}
              caption="50년 후"
              onJump={() => setYear(afterYear)}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => setYear(beforeYear)}>
              <ArrowLeft className="size-3.5" />
              50년 전
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setYear(current.startYear)}
            >
              이 사건
            </Button>
            <Button variant="outline" size="sm" onClick={() => setYear(afterYear)}>
              50년 후
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-8">
            <h3 className="text-[0.6875rem] tracking-wide text-subtle">
              관련 사건
            </h3>
            <ul className="mt-3 space-y-1">
              {related.map((other) => (
                <li key={other.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setYear(other.startYear);
                      select(other.id);
                    }}
                    className="flex min-h-11 w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-accent"
                  >
                    <Link2 className="mt-0.5 size-3.5 shrink-0 text-subtle" />
                    <span>
                      <span className="block text-sm text-foreground">
                        {other.title}
                      </span>
                      <span className="block font-serif text-xs text-muted-foreground">
                        {formatDistance(current.startYear, other.startYear)} ·{" "}
                        {formatYearRange(other.startYear, other.endYear)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8 pb-6">
          <h3 className="text-[0.6875rem] tracking-wide text-subtle">출처</h3>
          {current.sources && current.sources.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {current.sources.map((source) => (
                <li key={source.title} className="text-xs leading-relaxed text-subtle">
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-2 hover:text-foreground hover:underline"
                    >
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                  {source.publisher ? ` · ${source.publisher}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-subtle">
              이 항목은 아직 출처가 붙지 않았습니다. 검증된 사실처럼 단정하지 않습니다.
            </p>
          )}
        </section>
      </div>
    </DialogContent>
  );
}

function PeerRow({
  title,
  label,
  solid,
  onClick,
}: {
  title: string;
  label: string;
  solid: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-10 w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-accent"
      >
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full border border-current",
            solid ? "bg-current" : "bg-transparent",
          )}
          style={{ color: "var(--color-muted-foreground)" }}
        />
        <span className="min-w-0 flex-1 truncate text-sm">{title}</span>
        <span className="shrink-0 font-serif text-[0.625rem] text-subtle">{label}</span>
      </button>
    </li>
  );
}

function CompareColumn({
  year,
  caption,
  current,
  onJump,
}: {
  year: number;
  caption: string;
  current?: boolean;
  onJump: () => void;
}) {
  const snap = getYearSnapshot(year, { nearbyRange: 0, nearbyLimit: 0 });
  return (
    <button
      type="button"
      onClick={onJump}
      className={cn(
        "bg-popover px-2 py-3 text-left hover:bg-accent",
        current && "bg-secondary",
      )}
    >
      <p className="font-serif text-xs tabular-nums text-primary">{year}</p>
      <p className="mt-0.5 text-[0.625rem] text-subtle">{caption}</p>
      <ul className="mt-2 space-y-1.5">
        {REGIONS.map((id) => {
          const row = snap.regions.find((item) => item.region === id);
          return (
            <li key={id} className="min-w-0">
              <p className="truncate text-[0.625rem] text-subtle">
                {REGION_META[id].short}
              </p>
              <p className="truncate text-[0.6875rem] leading-snug text-foreground">
                {row?.headline.title ?? "—"}
              </p>
            </li>
          );
        })}
      </ul>
    </button>
  );
}
