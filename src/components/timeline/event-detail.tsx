import { ArrowLeft, ArrowRight, Link2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contemporaneous, getEventById, relatedEvents } from "@/lib/history/query";
import { CONFIDENCE_LABEL, KIND_LABEL, REGION_META } from "@/lib/history/regions";
import { useTimeline, useZoom } from "@/lib/history/store";
import {
  addYears,
  formatDistance,
  formatYearRange,
} from "@/lib/history/years";
import { cn } from "@/lib/utils";

export function EventDetail() {
  const selectedId = useTimeline((s) => s.selectedId);
  const select = useTimeline((s) => s.select);
  const setYear = useTimeline((s) => s.setYear);
  const event = selectedId ? getEventById(selectedId) : undefined;
  const zoom = useZoom();

  if (!event) return null;
  const current = event;

  const region = REGION_META[current.region];
  const related = relatedEvents(current);
  const range = zoom.step <= 10 ? 10 : 25;
  const peers = contemporaneous(current.startYear, range, current.id).slice(0, 8);

  function jump(offset: number) {
    setYear(addYears(current.startYear, offset));
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex max-h-[88vh] flex-col border-t border-border bg-popover",
        "md:inset-y-0 md:right-0 md:left-auto md:w-[28rem] md:border-t-0 md:border-l",
      )}
      role="dialog"
      aria-labelledby="event-title"
    >
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border md:hidden" />
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-[0.6875rem] tracking-wide text-subtle">
            {region.label} · {KIND_LABEL[current.kind]}
          </p>
          <h2
            id="event-title"
            className="mt-1 font-serif text-xl leading-snug text-foreground"
          >
            {current.title}
          </h2>
          <p className="mt-1 font-serif text-sm tabular-nums text-muted-foreground">
            {current.approximate ? "약 " : ""}
            {formatYearRange(current.startYear, current.endYear)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => select(null)}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          aria-label="닫기"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="text-sm leading-relaxed text-foreground">{current.summary}</p>
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
          <h3 className="text-[0.6875rem] tracking-wide text-subtle">
            전후 비교
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => jump(-50)}>
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
            <Button variant="outline" size="sm" onClick={() => jump(50)}>
              50년 후
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
          <p className="mt-2 text-center font-serif text-xs tabular-nums text-subtle">
            {addYears(current.startYear, -50)} ← {current.startYear} →{" "}
            {addYears(current.startYear, 50)}
          </p>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[0.6875rem] tracking-wide text-subtle">
              동시대 사건
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
          <ul className="mt-3 space-y-1">
            {peers.length === 0 && (
              <li className="text-sm text-subtle">가까운 기록이 없습니다.</li>
            )}
            {peers.map((peer) => (
              <li key={peer.id}>
                <button
                  type="button"
                  onClick={() => select(peer.id)}
                  className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-accent"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{
                      background: REGION_META[peer.region].token,
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {peer.title}
                  </span>
                  <span className="shrink-0 font-serif text-xs text-subtle">
                    {REGION_META[peer.region].short}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section className="mt-8">
            <h3 className="text-[0.6875rem] tracking-wide text-subtle">
              역사적 거리
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

        {current.sources && current.sources.length > 0 && (
          <section className="mt-8 pb-6">
            <h3 className="text-[0.6875rem] tracking-wide text-subtle">출처</h3>
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
          </section>
        )}
      </div>
    </div>
  );
}
